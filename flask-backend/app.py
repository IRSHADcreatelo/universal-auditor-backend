import os
import requests
from flask import Flask, request, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
import instaloader
from bs4 import BeautifulSoup

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("AIzaSyDLrIPX8L-dH1WWiXs7wCB_nKufkKJxGiY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

@app.route("/api/input")
def handle_input():
    user_input = request.args.get("input")
    if not user_input:
        return "No input provided", 400

    data = user_input.split(',')
    field_names = ['Name', 'Contact Number', 'Email', 'Website URL', 'Instagram Profile', 'Facebook ID']
    user_details = dict(zip(field_names, data))

    website = user_details.get("Website URL", "")
    instagram_url = user_details.get("Instagram Profile", "")
    facebook = user_details.get("Facebook ID", "")

    # Extract Instagram username
    insta_username = (
        instagram_url
        .replace("https://www.instagram.com/", "")
        .replace("http://www.instagram.com/", "")
        .replace("instagram.com/", "")
        .replace("@", "")
        .strip("/")
    )

    insta_data = scrape_instagram_data(insta_username)
    website_summary = scrape_website_meta(website)

    # Compose prompt for Gemini AI depending on Instagram data
    if "Error" in insta_data:
        prompt = f"""
        Analyze the following business presence in the digital world:

        Website URL: {website}
        Website Summary: {website_summary}

        Instagram ID: {insta_username}

        Facebook ID: {facebook}

        Provide insights and suggestions to improve their presence across the website, Instagram, and Facebook platforms.
        """
    else:
        prompt = f"""
        Examine the following business presence in the digital world:

        Website URL: {website}
        Website Summary: {website_summary}

        Instagram Details:
        - Followers: {insta_data.get('Followers')}
        - Bio: {insta_data.get('Bio')}
        - External URL: {insta_data.get('External URL')}

        Facebook ID: {facebook}

        Please provide insights and suggestions to improve their presence across the website, Instagram, and Facebook platforms.
        """

    try:
        response = model.generate_content(prompt)
        analysis = response.text
    except Exception as e:
        analysis = f"Error generating insights: {e}"

    return render_template("result.html", details=user_details, analysis=analysis, insta=insta_data)

def scrape_instagram_data(username):
    insta_data = {}
    try:
        L = instaloader.Instaloader()

        login_user = os.getenv('INSTA_USER')
        login_pass = os.getenv('INSTA_PASS')
        if login_user and login_pass:
            L.login(login_user, login_pass)

        profile = instaloader.Profile.from_username(L.context, username)
        insta_data = {
            "Username": profile.username,
            "Full Name": profile.full_name or "Not available",
            "Followers": profile.followers,
            "Bio": profile.biography or "Not available",
            "External URL": profile.external_url or "Not available"
        }
    except Exception as e:
        insta_data = {"Error": f"Could not fetch Instagram data for '{username}': {e}"}

    return insta_data

def scrape_website_meta(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')

        title = soup.title.string.strip() if soup.title else "Not available"
        desc_tag = soup.find("meta", attrs={"name": "description"})
        description = desc_tag["content"].strip() if desc_tag else "Not available"

        return f"Title: {title}. Description: {description}."
    except Exception as e:
        return f"Website metadata could not be fetched: {e}"

if __name__ == '__main__':
    app.run(debug=True)
