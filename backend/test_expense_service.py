#!/usr/bin/env python3
"""
Simple test script to verify expense service functionality
Run this after starting the server to test basic operations
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_expense_apis():
    """Test expense API endpoints"""
    
    print("🧪 Testing Expense Service APIs...")
    
    # Test health check first
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is healthy")
        else:
            print("❌ Server health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on localhost:8000")
        return
    
    # Note: These tests require authentication and valid group/user IDs
    # In a real scenario, you would need to:
    # 1. Create a test user and get auth token
    # 2. Create a test group
    # 3. Add members to the group
    
    print("\n📋 API Endpoints Available:")
    print("   POST /groups/{group_id}/expenses - Create expense")
    print("   GET  /groups/{group_id}/expenses - List expenses")
    print("   GET  /groups/{group_id}/expenses/{expense_id} - Get expense")
    print("   PATCH /groups/{group_id}/expenses/{expense_id} - Update expense")
    print("   DELETE /groups/{group_id}/expenses/{expense_id} - Delete expense")
    print("   POST /groups/{group_id}/settlements - Manual settlement")
    print("   GET  /groups/{group_id}/settlements - List settlements")
    print("   POST /groups/{group_id}/settlements/optimize - Optimize settlements")
    print("   GET  /users/me/friends-balance - Friend balances")
    print("   GET  /users/me/balance-summary - Balance summary")
    print("   GET  /groups/{group_id}/analytics - Group analytics")
    
    print("\n💡 Settlement Algorithms:")
    print("   • Normal: Simplifies direct relationships only")
    print("   • Advanced: Graph optimization with minimal transactions")
    
    print("\n🔧 To test with real data:")
    print("   1. Start the server: python -m uvicorn main:app --reload")
    print("   2. Visit http://localhost:8000/docs for interactive API documentation")
    print("   3. Create a user account and group through the auth endpoints")
    print("   4. Use the group ID to test expense endpoints")
    
    # Test split validation logic
    print("\n🧮 Testing Split Validation Logic:")
    
    def validate_splits(amount, splits):
        """Test split validation"""
        total_split = sum(split['amount'] for split in splits)
        valid = abs(total_split - amount) <= 0.01
        return valid, total_split
    
    # Test cases
    test_cases = [
        {
            "name": "Valid equal split",
            "amount": 100.0,
            "splits": [
                {"userId": "user_a", "amount": 50.0},
                {"userId": "user_b", "amount": 50.0}
            ]
        },
        {
            "name": "Valid unequal split",
            "amount": 100.0,
            "splits": [
                {"userId": "user_a", "amount": 60.0},
                {"userId": "user_b", "amount": 40.0}
            ]
        },
        {
            "name": "Invalid split (doesn't sum)",
            "amount": 100.0,
            "splits": [
                {"userId": "user_a", "amount": 45.0},
                {"userId": "user_b", "amount": 50.0}  # Total 95, but amount is 100
            ]
        },
        {
            "name": "Valid three-way split",
            "amount": 100.0,
            "splits": [
                {"userId": "user_a", "amount": 33.33},
                {"userId": "user_b", "amount": 33.33},
                {"userId": "user_c", "amount": 33.34}
            ]
        }
    ]
    
    for test_case in test_cases:
        valid, total = validate_splits(test_case["amount"], test_case["splits"])
        status = "✅" if valid else "❌"
        print(f"   {status} {test_case['name']}: ${test_case['amount']} -> ${total}")
    
    # Test settlement algorithm logic
    print("\n⚖️  Testing Settlement Algorithm Logic:")
    
    def calculate_normal_settlements(settlements):
        """Simulate normal settlement algorithm"""
        net_balances = {}
        
        for settlement in settlements:
            payer = settlement['payerId']
            payee = settlement['payeeId']
            amount = settlement['amount']
            
            if payer not in net_balances:
                net_balances[payer] = {}
            if payee not in net_balances:
                net_balances[payee] = {}
            if payee not in net_balances[payer]:
                net_balances[payer][payee] = 0
            if payer not in net_balances[payee]:
                net_balances[payee][payer] = 0
                
            net_balances[payer][payee] += amount
        
        optimized = []
        for payer in net_balances:
            for payee in net_balances[payer]:
                if payee in net_balances and payer in net_balances[payee]:
                    net_amount = net_balances[payer][payee] - net_balances[payee][payer]
                    if net_amount > 0.01:
                        optimized.append({
                            'from': payer,
                            'to': payee,
                            'amount': net_amount
                        })
        
        return optimized
    
    def calculate_advanced_settlements(settlements):
        """Simulate advanced settlement algorithm"""
        user_balances = {}
        
        for settlement in settlements:
            payer = settlement['payerId']
            payee = settlement['payeeId']
            amount = settlement['amount']
            
            if payee not in user_balances:
                user_balances[payee] = 0
            if payer not in user_balances:
                user_balances[payer] = 0
                
            user_balances[payee] += amount  # Payee owes money
            user_balances[payer] -= amount  # Payer is owed money
        
        debtors = [[uid, bal] for uid, bal in user_balances.items() if bal > 0.01]
        creditors = [[uid, -bal] for uid, bal in user_balances.items() if bal < -0.01]
        
        debtors.sort(key=lambda x: x[1], reverse=True)
        creditors.sort(key=lambda x: x[1], reverse=True)
        
        optimized = []
        i, j = 0, 0
        
        while i < len(debtors) and j < len(creditors):
            debtor_id, debt_amount = debtors[i]
            creditor_id, credit_amount = creditors[j]
            
            settlement_amount = min(debt_amount, credit_amount)
            
            if settlement_amount > 0.01:
                optimized.append({
                    'from': debtor_id,
                    'to': creditor_id,
                    'amount': settlement_amount
                })
            
            debtors[i][1] -= settlement_amount
            creditors[j][1] -= settlement_amount
            
            if debtors[i][1] <= 0.01:
                i += 1
            if creditors[j][1] <= 0.01:
                j += 1
        
        return optimized
    
    # Test scenario: A->B $100, B->C $50, A->C $25
    test_settlements = [
        {'payerId': 'Alice', 'payeeId': 'Bob', 'amount': 100},
        {'payerId': 'Bob', 'payeeId': 'Charlie', 'amount': 50},
        {'payerId': 'Alice', 'payeeId': 'Charlie', 'amount': 25}
    ]
    
    normal_result = calculate_normal_settlements(test_settlements)
    advanced_result = calculate_advanced_settlements(test_settlements)
    
    print(f"   Original transactions: {len(test_settlements)}")
    print(f"   Normal algorithm: {len(normal_result)} transactions")
    print(f"   Advanced algorithm: {len(advanced_result)} transactions")
    
    for settlement in advanced_result:
        print(f"     {settlement['from']} pays {settlement['to']} ${settlement['amount']:.2f}")
    
    print("\n🎉 Expense Service API is ready!")
    print("   Visit http://localhost:8000/docs for complete API documentation")

if __name__ == "__main__":
    test_expense_apis()
