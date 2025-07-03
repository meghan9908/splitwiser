import streamlit as st
import requests
from datetime import datetime
import json
import time

# Base URL for API
API_URL = "https://splitwiser-production.up.railway.app"

# Helper function to retry API calls
def make_api_request(method, url, headers=None, json_data=None, max_retries=3, retry_delay=1):
    retries = 0
    while retries < max_retries:
        try:
            if method.lower() == 'get':
                response = requests.get(url, headers=headers)
            elif method.lower() == 'post':
                response = requests.post(url, headers=headers, json=json_data)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            retries += 1
            if retries < max_retries:
                if st.session_state.debug_mode:
                    st.sidebar.warning(f"API request failed, retrying ({retries}/{max_retries}): {e}")
                time.sleep(retry_delay)
            else:
                raise
    
    return None  # This shouldn't be reached, but added for safety

st.title("Groups")

# Debug mode toggle
if "debug_mode" not in st.session_state:
    st.session_state.debug_mode = False

# Connection status and refresh button in sidebar
with st.sidebar:
    st.session_state.debug_mode = st.checkbox("Debug Mode", value=st.session_state.debug_mode)
    
    # Connection status check
    try:
        status_response = requests.get(f"{API_URL}/health", timeout=3)
        if status_response.status_code == 200:
            st.success("API Connection: Online")
        else:
            st.error(f"API Connection: Error (Status {status_response.status_code})")
    except Exception as e:
        st.error(f"API Connection: Offline")
        if st.session_state.debug_mode:
            st.write(f"Error: {str(e)}")

# Refresh button
refresh_col1, refresh_col2 = st.columns([8, 1])
with refresh_col2:
    if st.button("🔄"):
        st.rerun()

# Check if user is logged in
if "access_token" not in st.session_state or not st.session_state.access_token:
    st.warning("Please log in first")
    st.stop()

# Function to fetch user's groups
def fetch_user_groups():
    try:
        headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
        response = make_api_request(
            'get',
            f"{API_URL}/groups",
            headers=headers
        )
        
        # Debug info
        if st.session_state.debug_mode:
            st.sidebar.subheader("Debug: /groups response")
            st.sidebar.write(f"Status Code: {response.status_code}")
            try:
                st.sidebar.json(response.json())
            except:
                st.sidebar.write("Failed to parse response as JSON")
                st.sidebar.text(response.text)
        
        if response.status_code == 200:
            data = response.json()
            if 'groups' in data:
                return data['groups']
            else:
                st.error(f"Unexpected response format: 'groups' key not found in response")
                return []
        else:
            error_msg = "Unknown error"
            try:
                error_data = response.json()
                if 'detail' in error_data:
                    error_msg = error_data['detail']
            except:
                error_msg = f"HTTP {response.status_code}"
                
            st.error(f"Failed to fetch groups: {error_msg}")
            return []
    except Exception as e:
        st.error(f"Error fetching groups: {str(e)}")
        return []

# Function to fetch group members
def fetch_group_members(group_id):
    try:
        headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
        response = make_api_request(
            'get',
            f"{API_URL}/groups/{group_id}/members",
            headers=headers
        )
        
        # Debug info
        if st.session_state.debug_mode:
            st.sidebar.subheader(f"Debug: /groups/{group_id}/members response")
            st.sidebar.write(f"Status Code: {response.status_code}")
            try:
                st.sidebar.json(response.json())
            except:
                st.sidebar.write("Failed to parse response as JSON")
                st.sidebar.text(response.text)
        
        if response.status_code == 200:
            return response.json()
        else:
            error_msg = "Unknown error"
            try:
                error_data = response.json()
                if 'detail' in error_data:
                    error_msg = error_data['detail']
            except:
                error_msg = f"HTTP {response.status_code}"
                
            st.error(f"Failed to fetch group members: {error_msg}")
            return []
    except Exception as e:
        st.error(f"Error fetching members: {str(e)}")
        return []

# Function to fetch group expenses
def fetch_group_expenses(group_id):
    try:
        headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
        response = make_api_request(
            'get',
            f"{API_URL}/groups/{group_id}/expenses",
            headers=headers
        )
        
        # Debug info
        if st.session_state.debug_mode:
            st.sidebar.subheader(f"Debug: /groups/{group_id}/expenses response")
            st.sidebar.write(f"Status Code: {response.status_code}")
            try:
                st.sidebar.json(response.json())
            except:
                st.sidebar.write("Failed to parse response as JSON")
                st.sidebar.text(response.text)
        
        if response.status_code == 200:
            data = response.json()
            if 'expenses' in data:
                return data['expenses']
            else:
                st.error(f"Unexpected response format: 'expenses' key not found in response")
                if st.session_state.debug_mode:
                    st.write("Response data:", data)  # Debug info to see actual response structure
                return []
        else:
            error_msg = "Unknown error"
            try:
                error_data = response.json()
                if 'detail' in error_data:
                    error_msg = error_data['detail']
            except:
                error_msg = f"HTTP {response.status_code}"
                
            st.error(f"Failed to fetch expenses: {error_msg}")
            return []
    except Exception as e:
        st.error(f"Error fetching expenses: {str(e)}")
        return []

# Initialize session state for this page
if "groups_view" not in st.session_state:
    st.session_state.groups_view = "list"  # Can be "list" or "detail"
if "selected_group_id" not in st.session_state:
    st.session_state.selected_group_id = None

# Join Group Expander
with st.expander("Join a Group", expanded=False):
    with st.form("join_group_form_page", clear_on_submit=True):
        group_code = st.text_input("Enter Group Code", key="join_group_code_page")
        submit_button = st.form_submit_button("Join Group")
        
        if submit_button and group_code:
            try:
                headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
                response = make_api_request(
                    'post',
                    f"{API_URL}/groups/join",
                    headers=headers,
                    json_data={"joinCode": group_code}
                )
                if response.status_code == 200:
                    st.success("Successfully joined the group!")
                    st.rerun()
                else:
                    st.error(f"Failed to join group: {response.json().get('detail', 'Unknown error')}")
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Create Group Expander
with st.expander("Create a New Group", expanded=False):
    with st.form("create_group_form_page", clear_on_submit=True):
        group_name = st.text_input("Group Name", key="create_group_name_page")
        group_description = st.text_area("Description (Optional)", key="create_group_desc_page")
        submit_button = st.form_submit_button("Create Group")
        
        if submit_button and group_name:
            try:
                headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
                response = make_api_request(
                    'post',
                    f"{API_URL}/groups/",
                    headers=headers,
                    json_data={"name": group_name, "description": group_description or ""}
                )
                if response.status_code == 201:
                    st.success("Group created successfully!")
                    group_data = response.json()
                    st.info(f"Group Code: {group_data.get('group_code', 'N/A')}")
                    st.rerun()
                else:
                    st.error(f"Failed to create group: {response.json().get('detail', 'Unknown error')}")
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Display based on view state
if st.session_state.groups_view == "list":
    # Fetch and display user's groups
    groups = fetch_user_groups()
    
    if groups:
        for group in groups:
            with st.container():
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.subheader(group.get("name", "Unnamed Group"))
                    st.caption(f"Group Code: {group.get('joinCode', 'N/A')}")
                    if group.get("description"):
                        st.write(group.get("description"))
                with col2:
                    if st.button("View Details", key=f"view_group_page_{group.get('_id')}"):
                        st.session_state.groups_view = "detail"
                        st.session_state.selected_group_id = group.get('_id')
                        st.session_state.selected_group = group
                        st.rerun()
                st.divider()
    else:
        st.info("You haven't joined any groups yet.")

elif st.session_state.groups_view == "detail" and st.session_state.selected_group_id:
    # Back button
    if st.button("← Back to Groups", key="back_to_groups"):
        st.session_state.groups_view = "list"
        st.session_state.selected_group_id = None
        st.rerun()
    
    # Get group details
    group = st.session_state.selected_group
    
    # Group header
    st.header(group.get('name'))
    st.caption(f"Group Code: {group.get('joinCode')}")
    
    # Group Info
    with st.expander("Group Information", expanded=True):
        st.write(f"**Description:** {group.get('description', 'No description')}")
        st.write(f"**Created On:** {datetime.fromisoformat(group.get('createdAt').replace('Z', '+00:00')).strftime('%Y-%m-%d')}")
    
    # Group Members
    with st.expander("Members", expanded=True):
        members = fetch_group_members(group.get('_id'))
        if members:
            for member in members:
                st.write(f"• {member.get('user', {}).get('name', 'Unknown User')}")
        else:
            st.write("No members found.")
    
    # Add Expense
    with st.expander("Add New Expense", expanded=False):
        with st.form(f"add_expense_form_page_{group.get('_id')}", clear_on_submit=True):
            expense_title = st.text_input("Expense Title", key=f"expense_title_page_{group.get('_id')}")
            expense_amount = st.number_input("Amount", min_value=0.01, format="%.2f", key=f"expense_amount_page_{group.get('_id')}")
            expense_description = st.text_area("Description (Optional)", key=f"expense_desc_page_{group.get('_id')}")
            expense_date = st.date_input("Date", key=f"expense_date_page_{group.get('_id')}")
            
            # Fetch members for payer selection
            members = fetch_group_members(group.get('_id'))
            member_options = {member.get('user', {}).get('name', f'User {i}'): member.get('userId') for i, member in enumerate(members, 1)}
            selected_payer = st.selectbox("Paid by", options=list(member_options.keys()), key=f"expense_payer_page_{group.get('_id')}")
            
            submit_button = st.form_submit_button("Add Expense")
            
            if submit_button and expense_title and expense_amount:
                try:
                    headers = {"Authorization": f"Bearer {st.session_state.access_token}"}
                    # Create equal splits for all members
                    try:
                        if not members:
                            st.error("No members found in group. Cannot create expense.")
                            st.stop()
                            
                        equal_split_amount = round(expense_amount / len(members), 2)
                        splits = [
                            {
                                "userId": member.get("userId"),
                                "amount": equal_split_amount,
                                "type": "equal"
                            }
                            for member in members
                        ]
                        
                        expense_data = {
                            "description": expense_title + (f" - {expense_description}" if expense_description else ""),
                            "amount": expense_amount,
                            "splits": splits,
                            "splitType": "equal",
                            "tags": []
                        }
                        
                        if st.session_state.debug_mode:
                            st.sidebar.subheader("Debug: Expense data being sent")
                            st.sidebar.json(expense_data)
                    except Exception as e:
                        st.error(f"Error creating expense data: {str(e)}")
                        st.stop()
                    
                    with st.spinner("Creating expense..."):
                            response = make_api_request(
                                'post',
                                f"{API_URL}/groups/{group.get('_id')}/expenses",
                                headers=headers,
                                json_data=expense_data
                            )
                    
                    if response.status_code == 201:
                        st.success("Expense added successfully!")
                        st.rerun()
                    else:
                        st.error(f"Failed to add expense: {response.json().get('detail', 'Unknown error')}")
                except Exception as e:
                    st.error(f"Error adding expense: {str(e)}")
    
    # Group Expenses
    st.subheader("Expenses")
    expenses = fetch_group_expenses(group.get('_id'))
    members = fetch_group_members(group.get('_id'))
    
    if expenses:
        for expense in expenses:
            with st.container():
                col1, col2, col3 = st.columns([3, 1, 1])
                with col1:
                    st.write(f"**{expense.get('description', 'Unnamed Expense')}**")
                with col2:
                    st.write(f"**₹{expense.get('amount', 0):.2f}**")
                with col3:
                    date_str = expense.get('createdAt', '')
                    if date_str:
                        try:
                            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                            st.write(date_obj.strftime('%Y-%m-%d'))
                        except:
                            st.write(date_str)
                
                # Get payer info
                payer_id = expense.get('createdBy')
                st.caption(f"Paid by: {next((m.get('user', {}).get('name', 'Unknown') for m in members if m.get('userId') == payer_id), 'Unknown')}")
                
                st.divider()
    else:
        st.info("No expenses in this group yet.")

# Debug information display
if st.session_state.debug_mode:
    st.subheader("Debug Information")
    st.write("API URL:", API_URL)
    st.write("Session State:", dict(st.session_state))
