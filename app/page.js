"use client";

import { useEffect, useState, useRef } from "react";
import Axios from "axios";

export default function Home() {
  const [data, setData] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [amountLoaded, setAmountLoaded] = useState(10);
  const [isLastCardIntersecting, setIsLastCardIntersecting] = useState(false);
  const [allCardsLoaded, setAllCardsLoaded] = useState(false);

  const observee = useRef(null);

  const API_PATH = process.env.API_URL;

  Axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
  Axios.defaults.headers.common["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,PATCH,OPTIONS";


  const getNotionData = async (start, amount) => {
    
    Axios.get( API_PATH + "/GetCardsDatabase", {
      params: {
        start: start,
        amount: amount
      }
    })
      .then(response => {
        setData(response.data.data);
      }).catch(error => {
        console.error(error);
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
      console.error(response);
    }
  };

  useEffect(() => { // Get data from Notion
    getNotionData(0, amountLoaded);
  }, [amountLoaded]);

  useEffect(() => {
    if (data.length === 0) { // Check data is loaded
      return;
    }

    if (allCardsLoaded) { // Check all cards are loaded
      return;
    }

    const gettingDetails = async () => {
      let allCardDetails = [...cardDetails];
      for (let i = allCardDetails.length; i < data.length; i++) {
        const details = await getCardDetails(data[i]["Card ID"]);
        details["Stock"] = data[i]["Stock"];
        allCardDetails.push(details);
      }

      setCardDetails(allCardDetails);
    }

    gettingDetails();
  }, [data]);

  useEffect(() => { // Observe last card
    if (observee.current === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLastCardIntersecting(true);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 1.0
      }
    );

    observer.observe(observee.current);

    return () => {
      observer.disconnect();
    };
  }, [observee, cardDetails]);

  useEffect(() => { // Load more cards
    if (isLastCardIntersecting) {
      setAmountLoaded(amountLoaded + 5);
      setIsLastCardIntersecting(false);
    }
  }, [isLastCardIntersecting]);

  // useEffect(() => { // Check all cards are loaded

  //   if (cardDetails.length !== 0 && data.length !== 0 && data.length < amountLoaded) {

  //     console.log("All cards loaded");
  //     setAllCardsLoaded(true);
  //   }

  // }, [cardDetails]);

  
  return (
    <body className="w-full flex flex-col items-center bg-white">
      <header className="w-full h-28 bg-gray-800 flex flex-row justify-center items-center">
        <h1 className="text-white text-5xl font-bold">Card Shop</h1>
      </header>
      <main className="w-11/12 h-fit grid grid-cols-6 grid-rows-5 py-3 gap-5">
        {data.map((_, index) => {
          return (
            index === amountLoaded - 1 ?
            <div ref={observee}>
              <Card key={index} cardDetails={cardDetails[index]}/>
            </div> :
            <Card key={index} cardDetails={cardDetails[index]}/>
          )
        })}
      </main>
    </body>
  );
}

function Card({ cardDetails }) {
  let name = cardDetails !== undefined ? cardDetails["CharacterName"] : null;
  let rarity = cardDetails !== undefined ? cardDetails["Rarity"] : null;
  let image = cardDetails !== undefined ? cardDetails["ImageUrl"] : null;
  let stock = cardDetails !== undefined ? cardDetails["Stock"] : null;
  let cardID = cardDetails !== undefined ? cardDetails["ID"] : null;
  let cardCode = cardDetails !== undefined ? cardDetails["Code"] : null;
  let SetNumber = cardDetails !== undefined ? cardDetails["SetNumber"] : null;
  let animeName = cardDetails !== undefined ? cardDetails["Series"] : null;



  return (
    // Old Card Design
    // <main className="w-full aspect-card relative ">
    //   <img src={image} alt={name} className="w-full h-full absolute z-0 object-cover" />
    //   <div className="w-full h-[13%] bg-black/[70%] absolute bottom-0 left-0 p-1 flex flex-row items-center">
    //     <h1 className="text-white text-2xl font-bold w-1/3 h-full leading-tight border-l-2 border-gray-300 flex flex-col justify-center items-center text-center">{rarity}</h1>
    //     <h1 className="text-white text-base font-medium w-1/3 h-full leading-tight border-x-2 border-gray-300 flex flex-col justify-center items-center text-center">{name}</h1>
    //     <h1 className="text-white text-lg font-medium w-1/3 h-full leading-tight border-r-2 border-gray-300 flex flex-col justify-center items-center text-center">{`${stock}\n`}<span className="text-sm"><i>left</i></span></h1>
    //   </div>
    // </main>

    <main className="w-full aspect-potrait relative bg-white shadow-card p-2 flex flex-col rounded">
      {image === null ? <div className="aspect-card w-full z-0 bg-grey-200"></div> : <img src={image} alt={name} className="aspect-card w-full z-0 object-cover" loading="lazy"/> } 
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <p className="text-base">
          {name}
        </p>
      </div>
    </main>
  )
}
