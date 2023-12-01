import requests

# List of phone numbers
phone_numbers = [
    "27785505136",
    "27739305878", "27736902598", "27712787388", "27638739312", "27677164704", "27629812551", "27785188532",
    "27742888915", "27662888142", "27710686054", "27737537669", "27719382338", "27646572947", "27713139196",
    "27614163938", "27845769263", "27632515593", "27611418901", "27622871956", "27680192911", "27813749290",
    "27849139580", "27848244370", "27738192829", "27679744943", "27616224996", "27824092125", "2784130968",
    "27664143718", "27680635466", "27814140020", "27659479955", "27710287497", "27844882360", "27648001533",
    "27761925259", "27768672893", "27732993755", "27823136508", "27628641500", "27638766751", "27711611835",
    "27614048626", "27734402449", "27796598011", "27634393424", "27614230610", "27678441692", "27614783462",
    "27684827838", "27746067214", "27768528808", "27781556791", "27726244211", "27834565121", "27736113037",
    "27733890030", "27836581528", "27765593649", "27930489692", "27717465251", "27730793411", "27787072945",
    "27810391662", "27643713059", "27760690034", "27647454843", "27619019732", "27719417268", "27840476263",
    "27820731005", "27617335725", "27611689300", "27717625795", "27782891753", "27788263051", "27814241761",
    "27791238206", "27735422333", "27682610370", "27697445012", "27695989041", "27815637770", "27738101785",
    "27823987519", "27813665144", "27677652418", "27713747693", "27648797107", "27780784996", "27764949687",
    "27731315770", "27670887872", "27847243398", "27676736380", "27678007654", "27662502081", "27624016381",
    "27676965366", "27784130968", "27798736273"
]



# Common values
hsm_id = "151540"
parameter_value = "Your input is invaluable to our small team's ongoing efforts to improve and expand. This questionnaire offers a direct channel for communication and issue resolution. Please spare 10-15 minutes to complete it through the provided link, if you have not done so already. Your feedback is greatly appreciated, and feel free to ask any questions here. Five respondents will randomly be selected to *receive R500* each as a thank you! Feedback form: https://documents.bitprop.com/tenant_information"

# Azure HTTP function URL
azure_function_url = "https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ=="

# Headers
headers = {
    "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA",
    "accept": "application/json",
    "content-type": "application/json",
}

# Loop through phone numbers
for phone_number in phone_numbers:
    # Construct the JSON body
    json_body = {
        "recipients": [
            {
                "phone": phone_number,
                "hsm_id": hsm_id,
                "parameters": [
                    {"key": "{{1}}", "value": parameter_value}
                ]
            }
        ]
    }

    # Send the HTTP POST request
    response = requests.post(azure_function_url, json=json_body, headers=headers)

    # Check the response status
    if response.status_code == 200:
        print(f"Message sent to {phone_number} successfully.")
    else:
        print(f"Failed to send message to {phone_number}. Status code: {response.status_code}")
