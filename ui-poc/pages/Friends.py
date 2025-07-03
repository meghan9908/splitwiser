import streamlit as st
import requests

# Base URL for API
API_URL = "https://splitwiser-production.up.railway.app"

st.title("Friends")

# Check if user is logged in
if "access_token" not in st.session_state or not st.session_state.access_token:
    st.warning("Please log in first")
    st.stop()

st.info("Friends feature is coming soon!")

# Placeholder for future functionality
st.subheader("Features to be added:")
st.markdown("""
- Add friends
- View friend requests
- See shared expenses with friends
- Settle up with friends
""")
