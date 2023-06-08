"use client";

import { useEffect, useState, useRef } from "react";
import Axios from "axios";
import './globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Popover, RadioGroup  } from '@headlessui/react'

export default function Home() {

  const themes = [
    {
      name: "Blue",
      value: "theme-blue",
    },
    { 
      name: "Dark",
      value: "theme-dark",
    }
  ]

  const [data, setData] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [amountLoaded, setAmountLoaded] = useState(10);
  const [isLastCardIntersecting, setIsLastCardIntersecting] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "theme-blue");

  const observee = useRef(null);
  const mainBody = useRef(null);

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

  const getCardDetailsBatch = async (ids) => {
    const response = await Axios.post( API_PATH + "/GetCardDetailsBatch", {
      ids: [...ids]
    })
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(response);
    }
  };

  const setWebsiteTheme = (theme) => {
    let classes = mainBody.current.classList.value
    classes = classes.replace(/theme-(?:\w*)/, theme)
    mainBody.current.classList = classes
  }

  useEffect(() => { // Get data from Notion
    getNotionData(0, amountLoaded);
  }, [amountLoaded]);

  useEffect(() => {
    if (data.length === 0) { // Check data is loaded
      return;
    }

    const gettingDetailsByBatch = async () => {
      let allCardDetails = [...cardDetails];
      const ids = data.slice(allCardDetails.length, data.length).map(card => card["Card ID"]);
      const details = await getCardDetailsBatch(ids);
      for (let i = 0; i < details.length; i++) {
        details[i]["Stock"] = data[i]["Stock"];
      }
      allCardDetails.push(...details);

      setCardDetails(allCardDetails);

    }

    gettingDetailsByBatch();
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

  useEffect(() => { // Get theme from local storage
    const theme = localStorage.getItem("theme");
    if (theme === null) {
      localStorage.setItem("theme", "theme-blue");
    } else {
      // mainBody.current.classList.replace(RegExp('/(?:^|\s)theme-(?:\w*)'), theme);
      setWebsiteTheme(theme);
    }
  }, []);

  useEffect(() => { // Set theme to local storage
    localStorage.setItem("theme", theme);
    setWebsiteTheme(theme);
  }, [theme]);
  
  return (
    <body ref={mainBody} className="w-full flex flex-col items-center bg-background theme-blue">
      <header className="w-full h-28 bg-primary flex flex-row justify-center items-center relative z-10">
        <div id="control-panel" className="w-fit h-fit absolute top-1/2 -translate-y-1/2 left-1/24 flex gap-8">
          <Popover className="relative">
            <Popover.Button className="aspect-square p-2 rounded-md outline outline-1 outline-white">
              <i className="bi bi-palette2 inline-block text-2xl/[0] text-white"></i>
            </Popover.Button>
            <Popover.Panel className="absolute w-1/7vw bg-white p-3 shadow-popup mt-3 rounded-md">
              <RadioGroup value={theme} onChange={setTheme} className="flex flex-col gap-5">
                <RadioGroup.Label>Themes</RadioGroup.Label>
                {themes.map((theme) => (
                  <RadioGroup.Option key={theme.name} value={theme.value}
                    className={`${theme.value} py-1 px-3 h-1/15vh bg-background outline outline-2 outline-primary outline-offset-1 rounded-sm flex flex-row`}>
                        {({ checked }) => (
                          <>
                            <div className="flex flex-col w-2/3 h-full items-start justify-center ">
                              <p className="text-primary font-bold text-lg">Primary</p>
                              <p className="text-text font-light text-sm">Text</p>
                            </div>
                            <div className="w-1 h-full bg-secondary"></div>
                            <div className="flex flex-1 justify-center items-center">
                              {checked ? <i className="bi bi-circle-fill text-2xl/[0] text-primary"></i> : <i className="bi bi-circle text-2xl/[0] text-primary"></i>}
                            </div>
                            
                          </>
                        )}
                    </RadioGroup.Option>
                ))}
              </RadioGroup>
            </Popover.Panel>
          </Popover>
          <button className="aspect-square p-2 rounded-md outline outline-1 outline-white">
            <i className="bi bi-funnel-fill inline-block text-2xl/[0] text-white"></i>
          </button>
        </div>
        <h1 className="text-white text-5xl font-bold">Card Shop</h1>
      </header>
      <main className="w-11/12 h-fit grid grid-cols-6 grid-rows-5 py-3 gap-5 z-0">
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
  let animeName = cardDetails !== undefined ? cardDetails["SeriesName"] : null;



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

    <main className="w-full aspect-potrait relative bg-white shadow-card pt-5 pr-5 pl-5 pb-5 flex flex-col rounded drop-shadow-card gap-2.5 overflow-hidden">
      {image === null ? <div className="aspect-card w-full z-0 bg-gray-200"></div> : <img src={image} alt={name} className="aspect-card w-full z-0 object-cover" loading="lazy"/> } 
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <p className="w-full h-fit text-md text-text font-bold text-center text-ellipsis">
          {name}
        </p>
        <p className="w-full h-fit text-sm text-secondary font-light text-center text-ellipsis">
          {animeName}
        </p>
      </div>
      <div className="absolute w-full h-1/9 bg-gold/[0.9] flex justify-center items-center top-8 left-rarity -rotate-45">
        <p className="text-white text-3xl font-bold">
          {rarity}
        </p>
      </div>
    </main>
  )
}
