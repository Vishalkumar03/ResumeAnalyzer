from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",  # Replace with your MySQL username
    password="Vishalmysql@1",  # Replace with your MySQL password
    database="resume_analyzer"  # Replace with your database name
)
cursor = db.cursor()

# Load SpaCy model and Hugging Face pipeline once to improve performance
nlp = spacy.load('en_core_web_lg')
sentiment_analyzer = pipeline('sentiment-analysis', model="allenai/longformer-base-4096")

@app.route('/')
def home():
    """Root route to check if the server is running."""
    return 'Welcome to the Resume Analyzer API!'

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """Analyze resume and job description."""
    try:
        # Extract data from the request
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')

        if not resume_text or not job_description:
            return jsonify({'error': 'Both resume text and job description are required'}), 400

        # Debugging: Print resume and job description
        print(f"Resume Text: {resume_text}")
        print(f"Job Description: {job_description}")

        # Analyze resume text with SpaCy
        resume_doc = nlp(resume_text)
        job_doc = nlp(job_description)

        # Extract skills from both the resume and the job description
        predefined_skills = ['Java', 'Python', 'SQL', 'AWS', 'Azure', 'JavaScript', 'C', 'TypeScript', 'NodeJS', 'ReactJS', 'C#', 'GraphQL', 'SQLite', 'WPF']

        # Skill matching
        resume_skills = {chunk.text.strip().lower() for chunk in resume_doc.noun_chunks if chunk.text.strip().lower() in [skill.lower() for skill in predefined_skills]}
        job_skills = {chunk.text.strip().lower() for chunk in job_doc.noun_chunks if chunk.text.strip().lower() in [skill.lower() for skill in predefined_skills]}

        # Debugging: Print matching skills
        print(f"Resume Skills: {resume_skills}")
        print(f"Job Skills: {job_skills}")

        # Calculate the match score based on skills
        matching_skills = resume_skills.intersection(job_skills)
        skill_match_score = len(matching_skills) / len(job_skills) * 100 if job_skills else 0

        # Debugging: Print skill match score
        print(f"Matching Skills: {matching_skills}")
        print(f"Skill Match Score: {skill_match_score}")

        # Calculate semantic similarity between resume and job description
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        
        # Debugging: Print TF-IDF matrix
        print(f"TF-IDF Matrix: {tfidf_matrix.toarray()}")

        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100

        # Debugging: Print similarity
        print(f"Cosine Similarity: {similarity}")

        # Combine skill match score and semantic similarity
        overall_score = (skill_match_score * 0.6) + (similarity * 0.4)  # Adjust weights as needed

        # Determine fit status based on overall score
        #fit_status = "Good fit" if overall_score >= 60 else "Not a good fit"
        if overall_score < 50:
            fit_status = "Not a good fit"
        elif overall_score >= 50 and overall_score < 80:
            fit_status = "Neutral"
        else:
            fit_status ="superfit"


        # Prepare response
        return jsonify({
            'score': overall_score,
            'is_good_fit': fit_status,
            'matching_skills': list(matching_skills),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
