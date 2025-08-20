
import sys
import os
sys.path.append(os.path.dirname(__file__))

from agents.third_agent import AutonomousAgent

def test_enhanced_autonomous_agent():
    # Test the autonomous agent with real tools
    agent = AutonomousAgent("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")
    

    print("Testing web search capabilities")
    print("="*60)
    
    # Test web search capabilities
    agent.clear_history()
    try:
        response = agent.chat("What is the latest news about AI developments in detail in august 2025 this week?")
        print(f"\nFINAL RESPONSE: {response}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_autonomous_agent()