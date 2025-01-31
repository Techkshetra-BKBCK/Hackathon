

print("Enter your personal and health-related information:")
name = input("Name: ")
age = input("Age: ")
gender = input("Gender: ")
phone = input("Phone Number: ")


# Store data in a dictionary
personal_data = {
        'Name': name,
        'Age': age,
        'Gender': gender,
        'Phone': phone
    }



user=input("Enter:")
full_data=user.split(' ')
for i in full_data:
    for j in personal_data:
        if i.lower()==j.lower():
            print(personal_data[j])
            break
    print(i)    
