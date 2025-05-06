from flask_login import UserMixin
import os

class AdminUser(UserMixin):
    def __init__(self, id):
        self.id = id
        self.name = "admin"
        
    def check_password(self, password):
        expected = os.getenv("ADMIN_PASSWORD")
        return expected and password == expected
