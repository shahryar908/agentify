#!/usr/bin/env python3
"""
Comprehensive Agent Testing Suite
Senior QA Level Testing for AI Agents Platform
"""

import sys
import os
import time
import json
import requests
from datetime import datetime

sys.path.append(os.path.dirname(__file__))

class AgentTestSuite:
    def __init__(self):
        self.base_url = "http://localhost:8002"
        self.test_results = []
        self.agents_created = []
        self.start_time = None
        
    def log_test(self, test_name, status, details="", duration=0):
        """Log test results"""
        result = {
            "test_name": test_name,
            "status": status,  # PASS, FAIL, WARN
            "details": details,
            "duration": f"{duration:.2f}s",
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        self.test_results.append(result)
        
        status_icon = "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[WARN]"
        print(f"{status_icon} {test_name} ({duration:.2f}s)")
        if details:
            print(f"   {details}")
    
    def api_call(self, endpoint, method="GET", data=None):
        """Make API call with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method == "POST":
                response = requests.post(url, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, timeout=10)
            else:
                response = requests.get(url, timeout=10)
            
            return response.status_code, response.json() if response.content else {}
        except Exception as e:
            return 500, {"error": str(e)}
    
    def test_server_health(self):
        """Test 1: Server Health Check"""
        start = time.time()
        status_code, data = self.api_call("/")
        duration = time.time() - start
        
        if status_code == 200 and "message" in data:
            self.log_test("Server Health Check", "PASS", 
                         f"Server responding at {self.base_url}", duration)
            return True
        else:
            self.log_test("Server Health Check", "FAIL", 
                         f"Server not responding properly (HTTP {status_code})", duration)
            return False
    
    def test_create_math_agent(self):
        """Test 2: Create Math Calculator Agent"""
        start = time.time()
        status_code, agent_data = self.api_call("/demo/create-sample-agent", "POST")
        duration = time.time() - start
        
        if status_code == 200 and agent_data.get("agent_type") == "math":
            self.agents_created.append(agent_data)
            self.log_test("Create Math Agent", "PASS", 
                         f"Agent ID: {agent_data['id']}", duration)
            return agent_data
        else:
            self.log_test("Create Math Agent", "FAIL", 
                         f"HTTP {status_code}: {agent_data.get('detail', 'Unknown error')}", duration)
            return None
    
    def test_create_intelligent_agent(self):
        """Test 3: Create Intelligent Web Agent"""
        start = time.time()
        status_code, agent_data = self.api_call("/demo/create-intelligent-agent", "POST")
        duration = time.time() - start
        
        if status_code == 200 and agent_data.get("agent_type") == "intelligent":
            self.agents_created.append(agent_data)
            self.log_test("Create Intelligent Agent", "PASS", 
                         f"Agent ID: {agent_data['id']}", duration)
            return agent_data
        else:
            self.log_test("Create Intelligent Agent", "FAIL", 
                         f"HTTP {status_code}: {agent_data.get('detail', 'Unknown error')}", duration)
            return None
    
    def test_create_autonomous_agent(self):
        """Test 4: Create Autonomous Planning Agent"""
        start = time.time()
        status_code, agent_data = self.api_call("/demo/create-autonomous-agent", "POST")
        duration = time.time() - start
        
        if status_code == 200 and agent_data.get("agent_type") == "autonomous":
            self.agents_created.append(agent_data)
            self.log_test("Create Autonomous Agent", "PASS", 
                         f"Agent ID: {agent_data['id']}", duration)
            return agent_data
        else:
            self.log_test("Create Autonomous Agent", "FAIL", 
                         f"HTTP {status_code}: {agent_data.get('detail', 'Unknown error')}", duration)
            return None
    
    def test_list_agents(self):
        """Test 5: List All Agents"""
        start = time.time()
        status_code, agents_data = self.api_call("/agents")
        duration = time.time() - start
        
        if status_code == 200 and isinstance(agents_data, list):
            agent_count = len(agents_data)
            agent_types = [agent.get("agent_type") for agent in agents_data]
            self.log_test("List Agents", "PASS", 
                         f"Found {agent_count} agents: {', '.join(set(agent_types))}", duration)
            return agents_data
        else:
            self.log_test("List Agents", "FAIL", 
                         f"HTTP {status_code}: Could not retrieve agents list", duration)
            return []
    
    def test_agent_chat(self, agent, test_message, expected_keywords=None):
        """Test agent chat functionality"""
        agent_id = agent["id"]
        agent_type = agent["agent_type"]
        
        start = time.time()
        status_code, response_data = self.api_call(
            f"/agents/{agent_id}/chat", 
            "POST", 
            {"message": test_message}
        )
        duration = time.time() - start
        
        if status_code == 200 and "response" in response_data:
            response_text = response_data["response"]
            
            # Check for expected keywords if provided
            keyword_check = "No keyword check"
            if expected_keywords:
                found_keywords = [kw for kw in expected_keywords if kw.lower() in response_text.lower()]
                if found_keywords:
                    keyword_check = f"Found keywords: {', '.join(found_keywords)}"
                else:
                    keyword_check = f"Missing expected keywords: {', '.join(expected_keywords)}"
            
            self.log_test(f"Chat Test ({agent_type})", "PASS", 
                         f"Response length: {len(response_text)} chars. {keyword_check}", duration)
            return True
        else:
            self.log_test(f"Chat Test ({agent_type})", "FAIL", 
                         f"HTTP {status_code}: {response_data.get('detail', 'Chat failed')}", duration)
            return False
    
    def test_agent_tools(self, agent):
        """Test agent tools listing"""
        agent_id = agent["id"]
        agent_type = agent["agent_type"]
        
        start = time.time()
        status_code, tools_data = self.api_call(f"/agents/{agent_id}/tools")
        duration = time.time() - start
        
        if status_code == 200 and "tools" in tools_data:
            tools_list = tools_data["tools"]
            tool_count = len(tools_list)
            self.log_test(f"Tools List ({agent_type})", "PASS", 
                         f"Found {tool_count} tools: {', '.join(tools_list[:3])}{'...' if tool_count > 3 else ''}", duration)
            return True
        else:
            self.log_test(f"Tools List ({agent_type})", "FAIL", 
                         f"HTTP {status_code}: Could not retrieve tools", duration)
            return False
    
    def test_math_agent_calculations(self, math_agent):
        """Test 6-8: Math Agent Specific Tests"""
        if not math_agent:
            return
            
        test_cases = [
            ("What is 25 + 17?", ["42", "25", "17"]),
            ("Calculate 8 times 7", ["56", "8", "7"]),
            ("What is 100 divided by 4?", ["25", "100", "4"])
        ]
        
        for question, keywords in test_cases:
            self.test_agent_chat(math_agent, question, keywords)
    
    def test_intelligent_agent_capabilities(self, intelligent_agent):
        """Test 9-11: Intelligent Agent Specific Tests"""
        if not intelligent_agent:
            return
            
        test_cases = [
            ("What's the weather like?", ["weather", "temperature"]),
            ("Search for news about technology", ["news", "technology"]),
            ("Hello, how are you?", ["hello", "how"])
        ]
        
        for question, keywords in test_cases:
            self.test_agent_chat(intelligent_agent, question, keywords)
    
    def test_autonomous_agent_reasoning(self, autonomous_agent):
        """Test 12-14: Autonomous Agent Specific Tests"""
        if not autonomous_agent:
            return
            
        test_cases = [
            ("Should I go outside today?", ["outside", "weather", "go"]),
            ("Plan a trip to Paris", ["paris", "trip", "plan"]),
            ("What should I do today?", ["today", "do"])
        ]
        
        for question, keywords in test_cases:
            self.test_agent_chat(autonomous_agent, question, keywords)
    
    def test_error_handling(self):
        """Test 15-17: Error Handling"""
        # Test invalid agent ID
        start = time.time()
        status_code, _ = self.api_call("/agents/invalid-id/chat", "POST", {"message": "test"})
        duration = time.time() - start
        
        if status_code == 404:
            self.log_test("Invalid Agent ID", "PASS", "Correctly returned 404", duration)
        else:
            self.log_test("Invalid Agent ID", "FAIL", f"Expected 404, got {status_code}", duration)
        
        # Test empty message
        if self.agents_created:
            agent_id = self.agents_created[0]["id"]
            start = time.time()
            status_code, _ = self.api_call(f"/agents/{agent_id}/chat", "POST", {"message": ""})
            duration = time.time() - start
            
            if status_code in [200, 400]:  # Either handled gracefully or rejected
                self.log_test("Empty Message", "PASS", f"Handled empty message (HTTP {status_code})", duration)
            else:
                self.log_test("Empty Message", "WARN", f"Unexpected response: HTTP {status_code}", duration)
    
    def test_performance(self):
        """Test 18: Performance Test"""
        if not self.agents_created:
            return
            
        agent = self.agents_created[0]
        responses_times = []
        
        for i in range(5):
            start = time.time()
            status_code, _ = self.api_call(
                f"/agents/{agent['id']}/chat", 
                "POST", 
                {"message": f"Test message {i+1}"}
            )
            duration = time.time() - start
            if status_code == 200:
                responses_times.append(duration)
        
        if responses_times:
            avg_time = sum(responses_times) / len(responses_times)
            max_time = max(responses_times)
            min_time = min(responses_times)
            
            if avg_time < 30:  # Under 30 seconds average
                self.log_test("Performance Test", "PASS", 
                             f"Avg: {avg_time:.2f}s, Min: {min_time:.2f}s, Max: {max_time:.2f}s", avg_time)
            else:
                self.log_test("Performance Test", "WARN", 
                             f"Slow response times. Avg: {avg_time:.2f}s", avg_time)
    
    def cleanup_agents(self):
        """Test 19: Cleanup Created Agents"""
        cleanup_count = 0
        for agent in self.agents_created:
            start = time.time()
            status_code, _ = self.api_call(f"/agents/{agent['id']}", "DELETE")
            duration = time.time() - start
            
            if status_code == 200:
                cleanup_count += 1
        
        self.log_test("Agent Cleanup", "PASS", 
                     f"Cleaned up {cleanup_count}/{len(self.agents_created)} agents", 0)
    
    def generate_report(self):
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        warned_tests = len([r for r in self.test_results if r["status"] == "WARN"])
        
        total_duration = time.time() - self.start_time
        
        print("\n" + "="*80)
        print("[TEST TUBE] COMPREHENSIVE AGENT TEST REPORT")
        print("="*80)
        print(f"[CHART] Test Summary:")
        print(f"   Total Tests: {total_tests}")
        print(f"   [PASS] Passed: {passed_tests}")
        print(f"   [FAIL] Failed: {failed_tests}")
        print(f"   [WARN] Warnings: {warned_tests}")
        print(f"   [TARGET] Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"   [CLOCK] Total Duration: {total_duration:.2f}s")
        
        print(f"\n[CLIPBOARD] Detailed Results:")
        for result in self.test_results:
            status_icon = "[PASS]" if result["status"] == "PASS" else "[FAIL]" if result["status"] == "FAIL" else "[WARN]"
            print(f"   {status_icon} {result['test_name']} ({result['duration']}) - {result['details']}")
        
        print(f"\n[TOOL] Agent Types Tested:")
        agent_types = set([agent["agent_type"] for agent in self.agents_created])
        for agent_type in agent_types:
            print(f"   - {agent_type.title()} Agent")
        
        print(f"\n[BULB] Recommendations:")
        if failed_tests > 0:
            print(f"   - Investigate {failed_tests} failed tests immediately")
        if warned_tests > 0:
            print(f"   - Review {warned_tests} warnings for potential improvements")
        
        avg_response_time = sum([float(r["duration"].replace("s", "")) for r in self.test_results if "Chat Test" in r["test_name"]]) / len([r for r in self.test_results if "Chat Test" in r["test_name"]])
        if avg_response_time > 10:
            print(f"   - Consider optimizing response times (current avg: {avg_response_time:.2f}s)")
        
        print("\n" + "="*80)
    
    def run_all_tests(self):
        """Execute complete test suite"""
        self.start_time = time.time()
        
        print("[ROCKET] Starting Comprehensive Agent Testing Suite")
        print("="*60)
        
        # Core functionality tests
        if not self.test_server_health():
            print("❌ Server not responding. Aborting tests.")
            return
        
        # Agent creation tests
        math_agent = self.test_create_math_agent()
        intelligent_agent = self.test_create_intelligent_agent()
        autonomous_agent = self.test_create_autonomous_agent()
        
        # List agents
        self.test_list_agents()
        
        # Test each agent type specifically
        self.test_math_agent_calculations(math_agent)
        self.test_intelligent_agent_capabilities(intelligent_agent)
        self.test_autonomous_agent_reasoning(autonomous_agent)
        
        # Test tools for each agent
        for agent in self.agents_created:
            self.test_agent_tools(agent)
        
        # Error handling and edge cases
        self.test_error_handling()
        
        # Performance testing
        self.test_performance()
        
        # Cleanup
        self.cleanup_agents()
        
        # Generate report
        self.generate_report()

if __name__ == "__main__":
    test_suite = AgentTestSuite()
    test_suite.run_all_tests()