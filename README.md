Fake News Detection using Decision Tree & Flask

This project is a web-based fake news detection system built using a
Decision Tree model and Flask. It allows users to input news text, get
predictions (Real or Fake), and submit feedback to improve model
accuracy over time.

------------------------------------------------------------------------

## Project Setup Instructions

1. Clone the Repository

Clone or download the project to your local machine.

2. Set Up a Virtual Environment (Recommended)

``` bash

python -m venv venv

```

Activate the virtual environment:

-   On Windows:

``` bash

   venv\Scripts\activate

```

-   On macOS/Linux:

``` bash
    source venv/bin/activate

    ```
3. Install Required Packages

``` bash
pip install -r requirements.txt

```

------------------------------------------------------------------------

Model Preparation

4. Run the Jupyter Notebook

-   Open `decision_tree_model.ipynb` in Jupyter Notebook.
-   Execute all cells one by one.
-   This will:
    -   Train the Decision Tree model.
    -   Save `DT_model.pkl` (the model) and `vectorizer.pkl` (the text
        vectorizer).

------------------------------------------------------------------------

MongoDB Setup (For Feedback System)

 5. Install MongoDB

-   Download MongoDB Community Edition:\
    <https://www.mongodb.com/try/download/community>

6. Start MongoDB Service

-   On Windows, MongoDB runs as a service by default.

-   On macOS/Linux:

    ``` bash
    mongod

    ```

7. MongoDB Database

-   The app will automatically create:
    -   Database: `fakenewsdb`
    -   Collection: `feedback`
-   This will be used to store user feedback entries.

------------------------------------------------------------------------

Running the Flask Web App

8. Start the Flask Server

``` bash or Terminal

 run this following command  < python app.py > or run the app.py

```

9. Open in Browser

Go to your localhost:

    http://127.0.0.1:5000/

10. Use the Interface

-   Enter news text and click the Analyze button.
-   View prediction result: Real or Fake.
-   Click feedback buttons if the prediction is incorrect:
    -   "This is Real"
    -   "This is Fake"

------------------------------------------------------------------------

Frontend Customization

You can modify the UI as needed:

-   HTML: `templates/`
-   CSS: `static/css/`
-   JavaScript: `static/js/`

------------------------------------------------------------------------

 Features

-   Decision Tree-based text classification.
-   User feedback system stored in MongoDB or SQLite3.
-   Admin dashboard to review and approve feedback.
-   Pattern-based matching using cosine similarity to enhance
    predictions.

------------------------------------------------------------------------

 Notes

-   Ensure MongoDB is installed and running for full functionality.
-   Feedback-based predictions take precedence over model predictions
    when similar content is detected.

------------------------------------------------------------------------

------------------------------------------------------------------------

Login Instructions:

User & Admin Access

-   The application has a single text input for login on the main
    page.
-   Any name entered will allow user access to the prediction
    interface.
-   To access the admin dashboard (feedback page), enter the
    following name in the login box:

enter the below secret key in login page to access the admin page
```
    adminhhibatchc5

```
-   This special admin key allows access to the feedback review and
    management dashboard.

------------------------------------------------------------------------
