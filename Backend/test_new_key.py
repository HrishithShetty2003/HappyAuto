import googlemaps

gmaps = googlemaps.Client(key="AIzaSyClqjZRx50yieh3iyXT--fFHewXlXBjl60")

result = gmaps.directions(
    origin="Bangalore",
    destination="Chennai",
    mode="driving"
)

print("OK:", result[0]["legs"][0]["distance"]["text"])
