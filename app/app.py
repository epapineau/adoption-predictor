# Import libraries
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from werkzeug.routing import BaseConverter
from flask_sqlalchemy import SQLAlchemy 

# Flask setup
app = Flask(__name__)

# Connect to SQLite file
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///./db/database.sqlite"
db = SQLAlchemy(app)

#  Define class for training data
class Pet_Class(db.Model):
    __tablename__ = 'Pet_Training_Data'

    Type = db.Column(db.Integer)
    Name = db.Column(db.String(500))
    Age = db.Column(db.Integer)
    Breed1 = db.Column(db.Integer)
    Breed2 = db.Column(db.Integer)
    Gender = db.Column(db.Integer)
    Color1 = db.Column(db.Integer)
    Color2 = db.Column(db.Integer)
    Color3 = db.Column(db.Integer)
    MaturitySize = db.Column(db.Integer)
    FurLength = db.Column(db.Integer)
    Vaccinated = db.Column(db.Integer)
    Dewormed = db.Column(db.Integer)
    Sterilized = db.Column(db.Integer)
    Health = db.Column(db.Integer)
    Quantity = db.Column(db.Integer)
    Fee = db.Column(db.Integer)
    State = db.Column(db.Integer)
    RescuerID = db.Column(db.String(64))
    VideoAmt = db.Column(db.Integer)
    Description = db.Column(db.String(1000))
    PetID = db.Column(db.String(50), primary_key = True)
    PhotoAmt = db.Column(db.Float)
    AdoptionSpeed = db.Column(db.Integer)
    DescriptionLength = db.Column(db.Integer)
    MeanSentimentScore = db.Column(db.Float)
    BreedName1 = db.Column(db.String(1000))
    BreedName2 = db.Column(db.String(1000))
    ColorName1 = db.Column(db.String(1000))
    ColorName2 = db.Column(db.String(1000))
    ColorName3 = db.Column(db.String(1000))
    StateName = db.Column(db.String(1000))

    def __repr__(self):
        return '<Pet_Class %r>' % (self.PetID)

# Define class for accepting variable args
class ListConverter(BaseConverter):
    def to_python(self, value):
        return value.split('+')

    def to_url(self, values):
        return '+'.join(BaseConverter.to_url(value)
                        for value in values)

# Add listconverter 
app.url_map.converters['list'] = ListConverter

@app.before_first_request
def setup():
    db.create_all()

# Index route
@app.route("/")
def index():
    return render_template("index.html")

# Route to serve up SQLite file
@app.route("/api/train-data/<list:cols>")
def getdb(cols):

    # Create dictionaries of desired column for each adoption speed
    dictBySpeed = {}
    for speed in range(5):
        # Query for full table
        results = db.session.query(Pet_Class.Type, Pet_Class.Name, Pet_Class.Age,
                                Pet_Class.Breed1, Pet_Class.Breed2, Pet_Class.Color1,
                                Pet_Class.Color2, Pet_Class.Color3, Pet_Class.Dewormed,
                                Pet_Class.Fee, Pet_Class.FurLength, Pet_Class.Gender,
                                Pet_Class.Health, Pet_Class.MaturitySize,
                                Pet_Class.MeanSentimentScore, Pet_Class.PhotoAmt,
                                Pet_Class.Quantity, Pet_Class.State, Pet_Class.Sterilized,
                                Pet_Class.Vaccinated, Pet_Class.VideoAmt, Pet_Class.DescriptionLength,
                                Pet_Class.BreedName1, Pet_Class.BreedName2, Pet_Class.ColorName1,
                                Pet_Class.ColorName2, Pet_Class.ColorName3, Pet_Class.StateName)\
                                .filter(Pet_Class.AdoptionSpeed == speed).all()
        
        # Transform table into dictionary
        fullDict = {'Type': [result[0] for result in results],
                    'Name': [result[1] for result in results],
                    'Age': [result[2] for result in results],
                    'Breed1': [result[3] for result in results],
                    'Breed2': [result[4] for result in results],
                    'Color1': [result[5] for result in results],
                    'Color2': [result[6] for result in results],
                    'Color3': [result[7] for result in results],
                    'Dewormed': [result[8] for result in results],
                    'Fee': [result[9] for result in results],
                    'FurLength': [result[10] for result in results],
                    'Gender': [result[11] for result in results],
                    'Health': [result[12] for result in results],
                    'MaturitySize': [result[13] for result in results],
                    'MeanSentimentScore': [result[14] for result in results],
                    'PhotoAmt': [result[15] for result in results],
                    'Quantity': [result[16] for result in results],
                    'State': [result[17] for result in results],
                    'Sterilized': [result[18] for result in results],
                    'Vaccinated': [result[19] for result in results],
                    'VideoAmt': [result[20] for result in results],
                    'DescriptionLength': [result[21] for result in results],
                    'BreedName1': [result[22] for result in results],
                    'BreedName2': [result[23] for result in results],
                    'ColorName1': [result[24] for result in results],
                    'ColorName2': [result[25] for result in results],
                    'ColorName3': [result[26] for result in results],
                    'StateName': [result[27] for result in results]
                    }

        # Return full dictionary for 'all' request
        if (cols[0] == "all"):
            dictBySpeed[speed] = fullDict
        else: 
            # Extract only requested portions of dictionary
            reqDict = {}
            for col in cols:
                reqDict[col] = fullDict[col]
                
            dictBySpeed[speed] = reqDict
        
    return jsonify(dictBySpeed)

# Route to serve up 
@app.route("/data")
def data():
    return render_template("data.html")

# Route to serve up 
@app.route("/sources")
def sources():
    return render_template("sources.html")

# Route to serve up 
@app.route("/model")
def model():
    return render_template("model.html")

# Debugger
if __name__ == "__main__":
    app.run()