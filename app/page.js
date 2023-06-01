"use client";

import { useEffect, useState } from "react";
import Axios from "axios";

export default function Home() {
  const [data, setData] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);

  const API_PATH = process.env.API_URL;
  

  const getNotionData = async () => {
    
    Axios.get( API_PATH + "/GetCardsDatabase", {headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    }})
      .then(response => {
        setData(response.data.data);
      }).catch(error => {
        console.log(error);
      });
  };

  const getCardDetails = async (id) => {

    const response = await Axios.get( API_PATH + "/GetCardDetails", {
      params: {
        id: id
      }
    })
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(response);
    }
  };

  useEffect(() => {
    getNotionData();
  }, []);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    const cardDetails = async () => {
      let cardDetails = [];
      for (let i = 0; i < data.length; i++) {
        const details = await getCardDetails(data[i]["Card ID"]);
        details["Stock"] = data[i]["Stock"];
        cardDetails.push(details);
      }
      setCardDetails(cardDetails);
    }

    cardDetails();
  }, [data]);

  useEffect(() => {
    console.log(cardDetails);
  }, [cardDetails]);
  
  return (
    <body className="w-full flex flex-col items-center bg-white">
      <header className="w-full h-28 bg-gray-800 flex flex-row justify-center items-center">
        <h1 className="text-white text-5xl font-bold">Card Shop</h1>
      </header>
      <main className="w-11/12 h-fit grid grid-cols-6 grid-rows-5 py-3 gap-5">
        {cardDetails.map((card, index) => {
          return (
            <Card key={index} cardDetails={card} />
          )
        })}
      </main>
    </body>
  );
}

function Card({ cardDetails }) {

  let name = cardDetails["CharacterName"];
  let rarity = cardDetails["Rarity"];
  let image = cardDetails["ImageUrl"];
  let stock = cardDetails["Stock"];

  return (
    <main className="w-full aspect-card relative ">
      <img src={image} alt={name} className="w-full h-full absolute z-0 object-cover" />
      <div className="w-full h-[13%] bg-black/[70%] absolute bottom-0 left-0 p-1 flex flex-row items-center">
        <h1 className="text-white text-2xl font-bold w-1/3 h-full leading-tight border-l-2 border-gray-300 flex flex-col justify-center items-center text-center">{rarity}</h1>
        <h1 className="text-white text-base font-medium w-1/3 h-full leading-tight border-x-2 border-gray-300 flex flex-col justify-center items-center text-center">{name}</h1>
        <h1 className="text-white text-lg font-medium w-1/3 h-full leading-tight border-r-2 border-gray-300 flex flex-col justify-center items-center text-center">{`${stock}\n`}<span className="text-sm"><i>left</i></span></h1>
      </div>
    </main>
  )
}
