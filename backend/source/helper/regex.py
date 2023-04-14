import re

def email_validator(email_address: str) -> bool:
    regular_expression = r"^(?=.{1,64})(?=.{1,64}@.{1,64}$)[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
    if re.search(regular_expression, email_address):
        return True

    else:
        return False
    
def password_validator(password: str) -> bool:
    regular_expression = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&^+-=_(){}[\\]:;<>,.?~]{8,}$'
    if re.search(regular_expression, password):
        return True
    
    else:
        return False