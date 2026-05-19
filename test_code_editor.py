#!/usr/bin/env python3
"""
Quick test script for EthioCode Code Editor API
"""

import requests
import json

API_URL = "http://localhost:8000/api/v1"

def test_languages():
    """Test getting supported languages"""
    print("🔍 Testing: Get Supported Languages")
    response = requests.get(f"{API_URL}/code/languages")
    if response.status_code == 200:
        languages = response.json()["languages"]
        print(f"✅ Found {len(languages)} languages:")
        for lang in languages[:5]:
            print(f"   - {lang['icon']} {lang['name']} {lang['version']}")
        print(f"   ... and {len(languages) - 5} more")
    else:
        print(f"❌ Failed: {response.status_code}")
    print()

def test_python_execution():
    """Test Python code execution"""
    print("🐍 Testing: Python Code Execution")
    code = """
print("Hello from EthioCode!")
for i in range(5):
    print(f"Count: {i}")
"""
    
    response = requests.post(
        f"{API_URL}/code/run",
        json={
            "code": code,
            "language": "python",
            "stdin": ""
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status: {result['status']}")
        print(f"⏱️  Execution Time: {result['execution_time_ms']}ms")
        print(f"📤 Output:\n{result['output']}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
    print()

def test_javascript_execution():
    """Test JavaScript code execution"""
    print("🟡 Testing: JavaScript Code Execution")
    code = """
console.log("Hello from EthioCode!");
for (let i = 0; i < 5; i++) {
    console.log(`Count: ${i}`);
}
"""
    
    response = requests.post(
        f"{API_URL}/code/run",
        json={
            "code": code,
            "language": "javascript",
            "stdin": ""
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status: {result['status']}")
        print(f"⏱️  Execution Time: {result['execution_time_ms']}ms")
        print(f"📤 Output:\n{result['output']}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
    print()

def test_stdin():
    """Test code execution with stdin"""
    print("📥 Testing: Code with Input (stdin)")
    code = """
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to EthioCode!")
"""
    
    response = requests.post(
        f"{API_URL}/code/run",
        json={
            "code": code,
            "language": "python",
            "stdin": "Ethiopian Developer"
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status: {result['status']}")
        print(f"📤 Output:\n{result['output']}")
    else:
        print(f"❌ Failed: {response.status_code}")
    print()

def test_error_handling():
    """Test error handling"""
    print("⚠️  Testing: Error Handling")
    code = """
print("This will cause an error")
x = 1 / 0
"""
    
    response = requests.post(
        f"{API_URL}/code/run",
        json={
            "code": code,
            "language": "python",
            "stdin": ""
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status: {result['status']}")
        if result.get('error'):
            print(f"❌ Error (expected):\n{result['error'][:200]}...")
    else:
        print(f"❌ Failed: {response.status_code}")
    print()

def test_templates():
    """Test getting code templates"""
    print("📝 Testing: Code Templates")
    response = requests.get(f"{API_URL}/code/templates")
    if response.status_code == 200:
        templates = response.json()["templates"]
        print(f"✅ Found templates for {len(templates)} languages")
        print(f"   Languages: {', '.join(list(templates.keys())[:5])}...")
    else:
        print(f"❌ Failed: {response.status_code}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("🇪🇹 EthioCode Code Editor - API Test Suite")
    print("=" * 60)
    print()
    
    try:
        test_languages()
        test_python_execution()
        test_javascript_execution()
        test_stdin()
        test_error_handling()
        test_templates()
        
        print("=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to API")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
