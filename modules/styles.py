# DataPilot Custom Theme & UI Styles

CUSTOM_CSS = """
<style>
/* Font and Base Reset */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #FFFFFF;
}

/* App Background */
.stApp {
    background-color: #080D0C !important;
    color: #FFFFFF !important;
}

/* Main Block Padding */
.main .block-container {
    padding-top: 1.5rem;
    padding-bottom: 3rem;
    max-width: 1280px;
}

/* Sidebar Custom Styling */
section[data-testid="stSidebar"] {
    background-color: #0D1512 !important;
    border-right: 1px solid #244536 !important;
}

section[data-testid="stSidebar"] > div {
    background-color: #0D1512 !important;
}

/* Sidebar Radio Custom styling */
section[data-testid="stSidebar"] .stRadio label {
    color: #A7B5AE !important;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

section[data-testid="stSidebar"] .stRadio div[role="radiogroup"] > label:hover {
    color: #6EE7B7 !important;
}

section[data-testid="stSidebar"] .stRadio div[role="radiogroup"] > label[data-checked="true"] {
    color: #20C997 !important;
    font-weight: 700;
}

/* Top App Header / Bar */
.top-header {
    background: linear-gradient(135deg, #14231E 0%, #0D1512 100%);
    border: 1px solid #244536;
    border-radius: 14px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.top-header-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 8px;
}

.top-header-subtitle {
    font-size: 0.85rem;
    color: #A7B5AE;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(32, 201, 151, 0.12);
    border: 1px solid rgba(32, 201, 151, 0.35);
    color: #6EE7B7;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 9999px;
    letter-spacing: 0.5px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #20C997;
    box-shadow: 0 0 8px #20C997;
    animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
}

/* Hero Section */
.hero-card {
    background: linear-gradient(135deg, rgba(20, 35, 30, 0.95) 0%, rgba(13, 21, 18, 0.95) 100%);
    border: 1px solid #244536;
    border-radius: 16px;
    padding: 36px 32px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.hero-card::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(32, 201, 151, 0.15) 0%, transparent 70%);
    pointer-events: none;
}

.hero-title {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(120deg, #FFFFFF 30%, #6EE7B7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 6px;
}

.hero-subtitle {
    font-size: 1.1rem;
    font-weight: 500;
    color: #20C997;
    margin-bottom: 12px;
}

.hero-desc {
    font-size: 0.95rem;
    color: #A7B5AE;
    max-width: 680px;
    line-height: 1.6;
}

/* Feature Cards Grid */
.feature-card {
    background: #14231E;
    border: 1px solid #244536;
    border-radius: 14px;
    padding: 24px;
    height: 100%;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.feature-card:hover {
    transform: translateY(-4px);
    border-color: #20C997;
    box-shadow: 0 10px 24px rgba(32, 201, 151, 0.15);
}

.feature-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(32, 201, 151, 0.12);
    border: 1px solid rgba(32, 201, 151, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 16px;
}

.feature-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 8px;
}

.feature-desc {
    font-size: 0.88rem;
    color: #A7B5AE;
    line-height: 1.5;
    margin-bottom: 14px;
}

.badge-tag {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 6px;
    background: rgba(36, 69, 54, 0.6);
    color: #6EE7B7;
    border: 1px solid #244536;
}

/* KPI Cards */
.kpi-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 20px 0;
}

.kpi-card {
    background: linear-gradient(135deg, #14231E 0%, #0F1B17 100%);
    border: 1px solid #244536;
    border-radius: 12px;
    padding: 18px 20px;
    transition: border-color 0.2s ease, transform 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.kpi-card:hover {
    border-color: #20C997;
    transform: translateY(-2px);
}

.kpi-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #A7B5AE;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 8px;
}

.kpi-value {
    font-size: 1.85rem;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.5px;
    line-height: 1;
}

.kpi-accent {
    color: #6EE7B7;
}

/* File Upload Component Styling */
div[data-testid="stFileUploader"] {
    background: #14231E !important;
    border: 1.5px dashed #244536 !important;
    border-radius: 14px !important;
    padding: 24px !important;
    transition: all 0.25s ease;
}

div[data-testid="stFileUploader"]:hover {
    border-color: #20C997 !important;
    background: rgba(20, 35, 30, 0.9) !important;
}

div[data-testid="stFileUploader"] section {
    background-color: transparent !important;
}

div[data-testid="stFileUploader"] button {
    background-color: #20C997 !important;
    color: #080D0C !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 8px !important;
    transition: background-color 0.2s ease;
}

div[data-testid="stFileUploader"] button:hover {
    background-color: #6EE7B7 !important;
}

/* Tables & DataFrames */
div[data-testid="stDataFrame"] {
    background-color: #14231E !important;
    border: 1px solid #244536 !important;
    border-radius: 12px !important;
    overflow: hidden;
}

/* Streamlit buttons */
.stButton > button {
    background: linear-gradient(135deg, #20C997 0%, #17A57B 100%) !important;
    color: #080D0C !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 10px 24px !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 4px 12px rgba(32, 201, 151, 0.25) !important;
}

.stButton > button:hover {
    background: linear-gradient(135deg, #6EE7B7 0%, #20C997 100%) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 18px rgba(32, 201, 151, 0.4) !important;
}

/* Alert / Notification Overrides */
.stAlert {
    background-color: #14231E !important;
    border: 1px solid #244536 !important;
    border-radius: 10px !important;
    color: #FFFFFF !important;
}

/* Metadata pill box */
.meta-box {
    background: #0D1512;
    border: 1px solid #244536;
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
}
</style>
"""
