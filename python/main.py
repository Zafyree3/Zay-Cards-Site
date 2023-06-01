import cv2
from PIL import Image
import easyocr
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

camera = cv2.VideoCapture(0)

left, top, right, bottom = 0, 0, 0, 0

width = camera.get(cv2.CAP_PROP_FRAME_WIDTH)
height = camera.get(cv2.CAP_PROP_FRAME_HEIGHT)

boxheight = 30
boxwidth = 150

left = int((width/2)-boxwidth)
top = int((height/2)-boxheight)
right = int((width/2)+boxwidth)
bottom = int((height/2)+boxheight)

API_PATH = os.getenv("REACT_APP_API_URL")



def getImage():

    while True:
        _, frame = camera.read()
        if not _:
            print("failed to grab frame")
            break

        width = camera.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = camera.get(cv2.CAP_PROP_FRAME_HEIGHT)

        left = int((width/2)-boxwidth)
        top = int((height/2)-boxheight)
        right = int((width/2)+boxwidth)
        bottom = int((height/2)+boxheight)

        cv2.rectangle(frame, (left,top), (right,bottom), (0,255,0), 2)

        cv2.imshow("Frame", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.imwrite(os.path.join("C:/Users/irman/OneDrive/Documents/GitHub/zay-cards/src/python", "capture.png"), frame)
            break
    camera.release()
    cv2.destroyAllWindows()

def cropImage():
    img = Image.open(os.path.join("C:/Users/irman/OneDrive/Documents/GitHub/zay-cards/src/python", "capture.png"))
    img = img.crop((left,top,right,bottom))
    img.save(os.path.join("C:/Users/irman/OneDrive/Documents/GitHub/zay-cards/src/python", "capture.png"))

def getCardID():

    reader = easyocr.Reader(['en'], gpu=True)
    text = reader.readtext(os.path.join("C:/Users/irman/OneDrive/Documents/GitHub/zay-cards/src/python", "capture.png"))
    _, details, cardno = text.split("-")
    series = f"{int(details[0]):02d}"
    wave = details[len(details)-2 : len(details)]
    cardID = "NS-{}-M{}-{}".format(series, wave, cardno)
    return cardID

def updateDatabase(cardID_):

    getCardPageID = requests.get(API_PATH + "/GetCardPageID", params={"id": cardID_})
    if (getCardPageID.status_code == 200):
        pageID = getCardPageID.text

        getCardStock = requests.get(API_PATH + "/GetStock", params={"id": pageID})
        if (getCardStock.status_code == 200):
            stock = getCardStock.json()['stock']
            stock = int(stock) + 1
            updateCardStock = requests.put(API_PATH + "/UpdateStock", json={"id": pageID, "stock": stock})
            if (updateCardStock.status_code == 200):
                print("success")
    else:
        cardDetails = requests.get(API_PATH + "/GetCardDetails", params={"id": cardID_})
        cardImage = cardDetails.json()["ImageUrl"]
        createCardPage = requests.post( API_PATH + "/CreateCard", json={"cardID": cardID_, "cardImage": cardImage})
        if (createCardPage.status_code == 200):
            print("success")

def main():
    # getImage()
    # cropImage()
    # cardID = getCardID()
    print("_"*30)
    Series = input("Series: ")
    if Series == "quit" or Series == "exit" or Series == "q":
        exit()
    elif Series == "custom" or Series == "c":
        cardID = input("Card ID: ")
    else:
        Series = f"{int(Series):02d}"

        Wave = input("Wave: ")
        if Wave == "none" or Wave == "n":
            Wave = "00"
        Wave = f"{int(Wave):02d}"

        Rarity = input("Rarity: ")
        
        CardNo = input("Card No: ")
        CardNo = f"{int(CardNo):03d}"

        if Wave == "00":
            cardID = "NS-{}-{}".format(Series, CardNo)
        elif Rarity == "none" or Rarity == "n":
            cardID = "NS-{}-M{}-{}".format(Series, Wave, CardNo)
        else:
            cardID = "NS-{}-M{}-{}-{}".format(Series, Wave, Rarity, CardNo)
    cardID = cardID.upper()
    updateDatabase(cardID)

while True:

    main()
    
    print()