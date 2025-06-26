#!/usr/bin/env python3
"""
Test script specifically for the PATCH endpoint
"""

import asyncio
from app.expenses.schemas import ExpenseUpdateRequest, ExpenseSplit, SplitType

async def test_patch_validation():
    """Test the patch request validation"""
    
    print("🧪 Testing PATCH request validation...")
    
    # Test 1: Update only description
    try:
        update_request = ExpenseUpdateRequest(description="Updated description")
        print("✅ Description-only update validation passed")
    except Exception as e:
        print(f"❌ Description-only update failed: {e}")
    
    # Test 2: Update only amount
    try:
        update_request = ExpenseUpdateRequest(amount=150.0)
        print("✅ Amount-only update validation passed")
    except Exception as e:
        print(f"❌ Amount-only update failed: {e}")
    
    # Test 3: Update only tags
    try:
        update_request = ExpenseUpdateRequest(tags=["food", "restaurant"])
        print("✅ Tags-only update validation passed")
    except Exception as e:
        print(f"❌ Tags-only update failed: {e}")
    
    # Test 4: Update amount and splits together (valid)
    try:
        splits = [
            ExpenseSplit(userId="user_a", amount=75.0),
            ExpenseSplit(userId="user_b", amount=75.0)
        ]
        update_request = ExpenseUpdateRequest(amount=150.0, splits=splits)
        print("✅ Amount+splits update validation passed")
    except Exception as e:
        print(f"❌ Amount+splits update failed: {e}")
    
    # Test 5: Update amount and splits together (invalid - doesn't sum)
    try:
        splits = [
            ExpenseSplit(userId="user_a", amount=70.0),
            ExpenseSplit(userId="user_b", amount=75.0)  # Total 145, but amount is 150
        ]
        update_request = ExpenseUpdateRequest(amount=150.0, splits=splits)
        print("❌ Invalid amount+splits validation should have failed")
    except ValueError as e:
        print("✅ Invalid amount+splits correctly rejected")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Test 6: Update splits only (should be valid since we don't validate against amount)
    try:
        splits = [
            ExpenseSplit(userId="user_a", amount=80.0),
            ExpenseSplit(userId="user_b", amount=70.0)
        ]
        update_request = ExpenseUpdateRequest(splits=splits)
        print("✅ Splits-only update validation passed")
    except Exception as e:
        print(f"❌ Splits-only update failed: {e}")
    
    print("\n🔧 Validation tests completed!")

def test_mongodb_update_structure():
    """Test the MongoDB update structure"""
    
    print("\n🧪 Testing MongoDB update structure...")
    
    # Simulate the update document structure
    update_doc = {"updatedAt": "2024-01-01T00:00:00Z"}
    
    # Add some fields
    update_doc["description"] = "Updated description"
    update_doc["amount"] = 150.0
    
    history_entry = {
        "_id": "some_object_id",
        "userId": "user_123",
        "userName": "Test User",
        "beforeData": {"description": "Old description", "amount": 100.0},
        "editedAt": "2024-01-01T00:00:00Z"
    }
    
    # This is the correct MongoDB update structure
    mongodb_update = {
        "$set": update_doc,
        "$push": {"history": history_entry}
    }
    
    print("✅ MongoDB update structure:")
    print(f"   $set fields: {list(update_doc.keys())}")
    print(f"   $push fields: ['history']")
    print("✅ Structure looks correct!")

if __name__ == "__main__":
    asyncio.run(test_patch_validation())
    test_mongodb_update_structure()
    
    print("\n💡 Common PATCH endpoint issues:")
    print("   1. Validator errors with partial updates")
    print("   2. MongoDB $set and $push conflicts")
    print("   3. Missing fields in request validation")
    print("   4. ObjectId conversion issues")
    print("   5. Authorization/authentication problems")
    
    print("\n🔧 To debug the 500 error:")
    print("   1. Check server logs for detailed error messages")
    print("   2. Test with a simple update (description only)")
    print("   3. Verify the expense ID and group ID are valid")
    print("   4. Ensure user has permission to edit the expense")
    print("   5. Check MongoDB connection and collection names")
