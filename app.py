from flask import Flask, render_template, request, redirect, url_for, jsonify
import psycopg2
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from datetime import datetime

app = Flask(__name__)

USER = "postgres"
PASSWORD = "GNFispretty404!"

conn = psycopg2.connect(database="dannidines_db", 
                        user=USER, 
                        password=PASSWORD, 
                        host="localhost", port="5432")

cur = conn.cursor()

cur.execute('''CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    restaurant varchar(100) NOT NULL,
    review varchar(255),
    rating int,
    visited_date date,
    upload_date timestamp
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    review_id int NOT NULL,
    image_url varchar(255),
    display_order int
)''')

conn.commit()

cur.close()
conn.close()

@app.route('/')
def index():
    conn = psycopg2.connect(database="dannidines_db", 
                            user=USER, 
                            password=PASSWORD, 
                            host="localhost", port="5432")
    
    cur = conn.cursor()
    
    cur.execute('''SELECT l.id, l.restaurant, l.review, l.rating, l.visited_date, l.upload_date, i.image_url
                FROM logs l
                LEFT JOIN images i
                ON l.id = i.review_id 
                ORDER BY l.upload_date DESC, i.display_order ASC''')
    rows = cur.fetchall()
    data = {}
    for row in rows:
        if row[0] not in data:
            data[row[0]] = {
                'id': row[0],
                'restaurant': row[1],
                'review': row[2],
                'rating': row[3],
                'visited_date': row[4],
                'upload_date': row[5],
                'image_url': [row[6]] if row[6] else []
            }
        else:
            data[row[0]]['image_url'].append(row[6])

    data = list(data.values()) # list of dictionaries

    cur.close()
    conn.close()
    
    return render_template('logs.html', data=data)

@app.route('/api/reviews', methods=['POST'])
def create():
    restaurant = request.form.get('restaurant')
    review = request.form.get('review')
    rating = request.form.get('star-radio')
    visited_date = datetime.strptime(request.form.get('visited_date'), '%Y-%m-%d').date() if request.form.get('visited_date') else None
    upload_date = datetime.now()

    images = request.files.getlist('images')
    image_urls = []
    if images:
        cloudinary.config( 
            cloud_name = "fevai1sk", 
            api_key = "891443871163315", 
            api_secret = "NANKcpAYTrlsmlO82YtLIzwe0no", 
            secure=True
        )
        for image in images:
            upload_result = cloudinary.uploader.upload(image)
            image_urls.append(upload_result['secure_url'])
        pass
    
    conn = psycopg2.connect(database="dannidines_db", 
                        user=USER, 
                        password=PASSWORD, 
                        host="localhost", port="5432")

    cur = conn.cursor()

    cur.execute(
        '''INSERT INTO logs \
        (restaurant, review, rating, visited_date, upload_date) VALUES (%s, %s, %s, %s, %s)
        RETURNING id''',
        (restaurant, review, rating, visited_date, upload_date)
    )

    review_id = cur.fetchone()[0]

    for i, image_url in enumerate(image_urls):
        cur.execute(
            '''INSERT INTO images \
            (review_id, image_url, display_order) VALUES (%s, %s, %s)''',
            (review_id, image_url, i)
        )
    
    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Review created successfully",
        "id": review_id
    }, 201

@app.route('/reviews/<int:review_id>')
def review_page(review_id):
    return render_template('review.html', review_id=review_id)

@app.route('/api/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    conn = psycopg2.connect(database="dannidines_db", 
                                user=USER, 
                                password=PASSWORD, 
                                host="localhost", port="5432")
        
    cur = conn.cursor()
    
    cur.execute('''SELECT restaurant, review, rating, visited_date, upload_date
                FROM logs 
                WHERE id=%s''', (review_id,))
    data = cur.fetchone()

    if data is None:
        cur.close()
        conn.close()
        return {"error": "Review not found"}, 404

    data = {
        "restaurant": data[0],
        "review": data[1],
        "rating": data[2],
        "visited_date": data[3].isoformat() if data[3] else None,
        "upload_date": data[4].isoformat() if data[4] else None
    }

    cur.execute('''SELECT image_url
                FROM images
                WHERE review_id=%s
                ORDER BY display_order ASC''', (review_id,))
    images = cur.fetchall()
    data['images'] = [image[0] for image in images]

    cur.close()
    conn.close()

    return data

@app.route('/api/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    form_data = request.get_json()

    conn = psycopg2.connect(database="dannidines_db", 
                                user=USER, 
                                password=PASSWORD, 
                                host="localhost", port="5432")
        
    cur = conn.cursor()
    
    cur.execute('''UPDATE logs
                SET restaurant=%s, review=%s 
                WHERE id=%s''', (form_data.get('restaurant'), form_data.get('review'), review_id))

    conn.commit()   

    cur.close()
    conn.close()

    return {
        "message": "Review updated successfully",
        "id": review_id
    }, 200

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    conn = psycopg2.connect(database="dannidines_db", 
                                user=USER, 
                                password=PASSWORD, 
                                host="localhost", port="5432")
        
    cur = conn.cursor()
    
    cur.execute('''DELETE FROM logs 
                WHERE id=%s''', (review_id,))

    cur.execute('''DELETE FROM images 
                WHERE review_id=%s''', (review_id,))

    conn.commit()   

    cur.close()
    conn.close()

    return {
        "message": "Review deleted successfully",
        "id": review_id
    }, 200

if __name__ == '__main__':
    app.run(debug=True)