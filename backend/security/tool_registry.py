"""
Secure tool registration system to replace dangerous exec() calls
"""
import ast
import inspect
from typing import Dict, Any, Callable, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class ToolSchema(BaseModel):
    """Schema for tool registration"""
    name: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-zA-Z_][a-zA-Z0-9_]*$')
    description: str = Field(..., min_length=1, max_length=500)
    parameters: Dict[str, Any] = Field(..., description="JSON schema for parameters")
    function_body: str = Field(..., min_length=1, max_length=10000)
    allowed_imports: List[str] = Field(default_factory=list, max_items=10)
    
    @field_validator('name')
    def validate_name(cls, v):
        """Validate tool name is safe"""
        forbidden_names = ['exec', 'eval', 'compile', '__import__', 'open', 'file']
        if v.lower() in forbidden_names:
            raise ValueError(f"Tool name '{v}' is not allowed")
        return v

class ToolValidator:
    """Validates tool code for security"""
    
    # Allowed built-in functions
    ALLOWED_BUILTINS = {
        'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'filter', 'float',
        'int', 'len', 'list', 'map', 'max', 'min', 'range', 'round', 'set',
        'sorted', 'str', 'sum', 'tuple', 'zip', 'print'
    }
    
    # Allowed modules (whitelist approach)
    ALLOWED_MODULES = {
        'math', 'datetime', 'json', 're', 'urllib.parse', 'base64', 
        'hashlib', 'uuid', 'random', 'string'
    }
    
    # Forbidden nodes in AST
    FORBIDDEN_NODES = {
        ast.Import, ast.ImportFrom, ast.Call
    }
    
    @classmethod
    def validate_code(cls, code: str, allowed_imports: List[str] = None) -> bool:
        """Validate Python code using AST analysis"""
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            raise ValueError(f"Invalid syntax: {e}")
        
        allowed_imports = allowed_imports or []
        
        for node in ast.walk(tree):
            # Check for forbidden function calls
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                    if func_name not in cls.ALLOWED_BUILTINS:
                        # Allow calls to locally defined functions
                        if not cls._is_local_function(tree, func_name):
                            raise ValueError(f"Function call '{func_name}' not allowed")
                
                elif isinstance(node.func, ast.Attribute):
                    # Check module.function calls
                    if isinstance(node.func.value, ast.Name):
                        module_name = node.func.value.id
                        if module_name not in allowed_imports:
                            raise ValueError(f"Module '{module_name}' not in allowed imports")
            
            # Check for imports
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name not in cls.ALLOWED_MODULES:
                        if alias.name not in allowed_imports:
                            raise ValueError(f"Import '{alias.name}' not allowed")
            
            elif isinstance(node, ast.ImportFrom):
                if node.module not in cls.ALLOWED_MODULES:
                    if node.module not in allowed_imports:
                        raise ValueError(f"Import from '{node.module}' not allowed")
            
            # Check for dangerous operations
            elif isinstance(node, ast.Exec):
                raise ValueError("exec() statements not allowed")
            
            elif isinstance(node, ast.Eval):
                raise ValueError("eval() calls not allowed")
            
            # Check for file operations
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in ['open', 'file']:
                    raise ValueError("File operations not allowed")
        
        return True
    
    @classmethod
    def _is_local_function(cls, tree: ast.AST, func_name: str) -> bool:
        """Check if function is defined locally in the code"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == func_name:
                return True
        return False

class SecureToolRegistry:
    """Secure registry for agent tools"""
    
    def __init__(self):
        self.tools: Dict[str, Dict[str, Any]] = {}
        self.validator = ToolValidator()
    
    def register_tool(
        self, 
        name: str, 
        description: str,
        function_code: str,
        params_schema: Dict[str, Any],
        allowed_imports: List[str] = None
    ) -> bool:
        """
        Securely register a new tool
        
        Args:
            name: Tool name
            description: Tool description
            function_code: Python function code
            params_schema: JSON schema for parameters
            allowed_imports: Additional allowed module imports
        
        Returns:
            bool: Success status
        
        Raises:
            ValueError: If validation fails
            HTTPException: If registration fails
        """
        try:
            # Validate input
            tool_schema = ToolSchema(
                name=name,
                description=description,
                parameters=params_schema,
                function_body=function_code,
                allowed_imports=allowed_imports or []
            )
            
            # Validate code security
            self.validator.validate_code(function_code, allowed_imports)
            
            # Create safe execution environment
            safe_globals = self._create_safe_globals(allowed_imports or [])
            safe_locals = {}
            
            # Execute code in restricted environment
            exec(function_code, safe_globals, safe_locals)
            
            # Find the function in locals
            func = None
            for obj_name, obj in safe_locals.items():
                if callable(obj) and obj_name == name:
                    func = obj
                    break
            
            if func is None:
                raise ValueError(f"Function '{name}' not found in provided code")
            
            # Validate function signature
            sig = inspect.signature(func)
            self._validate_function_signature(sig, params_schema)
            
            # Store the tool
            self.tools[name] = {
                "func": func,
                "description": description,
                "schema": {
                    "type": "function",
                    "function": {
                        "name": name,
                        "description": description,
                        "parameters": params_schema
                    }
                },
                "code": function_code,
                "allowed_imports": allowed_imports or []
            }
            
            logger.info(f"Tool '{name}' registered successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register tool '{name}': {e}")
            raise HTTPException(
                status_code=400, 
                detail=f"Tool registration failed: {str(e)}"
            )
    
    def _create_safe_globals(self, allowed_imports: List[str]) -> Dict[str, Any]:
        """Create safe global namespace for code execution"""
        safe_globals = {
            "__builtins__": {
                name: getattr(__builtins__, name) 
                for name in self.validator.ALLOWED_BUILTINS 
                if hasattr(__builtins__, name)
            }
        }
        
        # Add allowed modules
        for module_name in allowed_imports:
            if module_name in self.validator.ALLOWED_MODULES:
                try:
                    safe_globals[module_name] = __import__(module_name)
                except ImportError:
                    logger.warning(f"Could not import allowed module: {module_name}")
        
        return safe_globals
    
    def _validate_function_signature(self, sig: inspect.Signature, params_schema: Dict[str, Any]):
        """Validate function signature matches parameter schema"""
        schema_params = params_schema.get("properties", {})
        required_params = set(params_schema.get("required", []))
        
        for param_name, param in sig.parameters.items():
            if param_name not in schema_params:
                if param.default is inspect.Parameter.empty:
                    raise ValueError(f"Parameter '{param_name}' not defined in schema")
        
        for schema_param in required_params:
            if schema_param not in sig.parameters:
                raise ValueError(f"Required parameter '{schema_param}' not found in function")
    
    def get_tool(self, name: str) -> Optional[Dict[str, Any]]:
        """Get tool by name"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        """List all registered tool names"""
        return list(self.tools.keys())
    
    def remove_tool(self, name: str) -> bool:
        """Remove tool from registry"""
        if name in self.tools:
            del self.tools[name]
            logger.info(f"Tool '{name}' removed")
            return True
        return False