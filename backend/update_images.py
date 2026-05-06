from pymongo import MongoClient
from bson import ObjectId

c = MongoClient('mongodb://localhost:27017')
db = c['ethiocode']

updates = [
    ('69fb40e8083c42c7fb1c7656', 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg'),  # kaloss coffee
    ('69fb454d7cee958947ed6138', 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg'),  # digiequb
]

for oid, img in updates:
    r = db.projects.update_one({'_id': ObjectId(oid)}, {'$set': {'featured_image': img}})
    print(f'Updated {oid}: {r.modified_count}')

for p in db.projects.find({}, {'title': 1, 'featured_image': 1}):
    print(p['title'], '->', p.get('featured_image'))
