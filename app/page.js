"use client";

import { useEffect, useState, useRef } from "react";
import Axios from "axios";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Popover, RadioGroup, Combobox } from "@headlessui/react";
import { ClickAwayListener } from "@mui/base";
import { themes, sets, rarities, series } from "./values";
import * as Accordion from "@radix-ui/react-accordion";

export default function Home() {
	const [data, setData] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]);
	const [cardDetails, setCardDetails] = useState([]);
	const [amountLoaded, setAmountLoaded] = useState(12);
	const [isLastCardIntersecting, setIsLastCardIntersecting] = useState(false);
	const [theme, setTheme] = useState(
		typeof window !== "undefined"
			? localStorage.getItem("theme") || "theme-blue"
			: ""
	);
	const [revealSideNav, setRevealSideNav] = useState(false);
	const [setFilter, setSetFilter] = useState([]);
	const [rarityFilter, setRarityFilter] = useState([]);
	const [seriesFilter, setSeriesFilter] = useState([]);
	const [seriesQuery, setSeriesQuery] = useState("");
	const [characterFilter, setCharacterFilter] = useState("");
	const [cardNoFilter, setCardNoFilter] = useState("");

	const sortedArray = (array, arrayFilter, query = "") => {
		let selectedItems = [];
		for (let i = 0; i < array.length; i++) {
			if (arrayFilter.includes(array[i])) {
				selectedItems.push(array[i]);
			}
		}
		if (query == "") {
			if (query == "") {
				if (selectedItems.length === 0) return array;

				return [
					...selectedItems,
					...array.filter((x) => !selectedItems.includes(x)),
				];
			}

			return [
				...selectedItems,
				...array.filter((x) => !selectedItems.includes(x)),
			];
		}
		return [
			...selectedItems,
			...array.filter((x) => !selectedItems.includes(x)),
		].filter((x) => x.toLowerCase().includes(query.toLowerCase()));
	};

	const [raritiesSorted, setRaritiesSorted] = useState(
		sortedArray(rarities, rarityFilter)
	);
	const [animeSorted, setAnimesSorted] = useState(
		sortedArray(series, seriesFilter)
	);

	const observee = useRef(null);
	const mainBody = useRef(null);

	const API_PATH = process.env.API_URL;

	Axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
	Axios.defaults.headers.common["Access-Control-Allow-Methods"] =
		"GET,PUT,POST,DELETE,PATCH,OPTIONS";

	const getNotionData = async (start, amount) => {
		Axios.get(API_PATH + "/GetCardsDatabase", {
			params: {
				start: start,
				amount: amount,
			},
		})
			.then((response) => {
				setData(response.data.data);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const getCardDetailsBatch = async (ids) => {
		const response = await Axios.post(API_PATH + "/GetCardDetailsBatch", {
			ids: [...ids],
		});
		if (response.status === 200) {
			return response.data;
		} else {
			console.error(response);
		}
	};

	const setWebsiteTheme = (theme) => {
		let classes = mainBody.current.classList.value;
		classes = classes.replace(/theme-(?:\w*)/, theme);
		mainBody.current.classList = classes;
	};

	const filterCards = () => {
		let tempData = [...cardDetails];

		if (setFilter.length > 0) {
			tempData = tempData.filter((card) => {
				return setFilter.includes(card["SetNumber"]);
			});
		}
		if (rarityFilter.length > 0) {
			tempData = tempData.filter((card) => {
				return rarityFilter.includes(card["Rarity"]);
			});
		}
		if (seriesFilter.length > 0) {
			tempData = tempData.filter((card) => {
				return seriesFilter.includes(card["Series"]);
			});
		}
		if (characterFilter !== "") {
			tempData = tempData.filter((card) => {
				return card["Character"].toLowerCase().includes(characterFilter);
			});
		}
		if (cardNoFilter !== "") {
			tempData = tempData.filter((card) => {
				return card["CardNo"].toLowerCase().includes(cardNoFilter);
			});
		}

		setFilteredCards(tempData);
	};

	const resetFilters = () => {
		setSetFilter([]);
		setRarityFilter([]);
		setSeriesFilter([]);
		setCharacterFilter("");
		setCardNoFilter("");
		setFilteredCards([...cardDetails]);
	};

	useEffect(() => {
		// Get data from Notion
		getNotionData(0, amountLoaded);
	}, [amountLoaded]);

	useEffect(() => {
		if (data.length === 0) {
			// Check data is loaded
			return;
		}

		const gettingDetailsByBatch = async () => {
			let allCardDetails = [...cardDetails];
			const ids = data
				.slice(allCardDetails.length, data.length)
				.map((card) => card["Card ID"]);
			const details = await getCardDetailsBatch(ids);
			for (let i = 0; i < details.length; i++) {
				details[i]["Stock"] = data[i]["Stock"];
			}
			allCardDetails.push(...details);

			setCardDetails(allCardDetails);
		};

		gettingDetailsByBatch();
	}, [data]);

	useEffect(() => {
		setFilteredCards([...cardDetails]);
	}, [cardDetails]);

	useEffect(() => {
		// Observe last card
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
				rootMargin: "100px",
				threshold: 1.0,
			}
		);

		observer.observe(observee.current);

		return () => {
			observer.disconnect();
		};
	}, [observee]);

	useEffect(() => {
		// Load more cards
		if (isLastCardIntersecting) {
			setIsLastCardIntersecting(false);

			if (amountLoaded > cardDetails.length) {
				return;
			}

			setAmountLoaded(amountLoaded + 7);
		}
	}, [isLastCardIntersecting]);

	useEffect(() => {
		// Get theme from local storage
		let browserTheme;

		if (typeof window !== "undefined") {
			browserTheme = localStorage.getItem("theme");
		}
		if (browserTheme === null) {
			if (typeof window !== "undefined") {
				localStorage.setItem("theme", "theme-blue");
			}
		} else {
			// mainBody.current.classList.replace(RegExp('/(?:^|\s)theme-(?:\w*)'), theme);
			setWebsiteTheme(browserTheme);
		}
	}, []);

	useEffect(() => {
		setRaritiesSorted(sortedArray(rarities, rarityFilter));
	}, [rarityFilter]);

	useEffect(() => {
		setAnimesSorted(sortedArray(series, seriesFilter, seriesQuery));
	}, [seriesFilter, seriesQuery]);

	useEffect(() => {
		// Set theme to local storage
		if (typeof window !== "undefined") {
			localStorage.setItem("theme", theme);
		}
		setWebsiteTheme(theme);
	}, [theme]);

	return (
		<body
			ref={mainBody}
			className="theme-blue bg-background flex w-full flex-col items-center"
		>
			<header className="bg-primary relative z-20 flex h-28 w-full flex-row items-center justify-evenly">
				<div className="md:left-50 relative flex h-auto w-auto gap-2 md:absolute md:bottom-4 md:left-1/2 md:w-11/12 md:-translate-x-1/2">
					<Popover className="relative">
						<Popover.Button className="aspect-square rounded-md p-2 outline outline-1 outline-white">
							<i className="bi bi-palette2 inline-block text-xl/[0] text-white md:text-2xl/[0]"></i>
						</Popover.Button>
						<Popover.Panel className="w-2/3vw shadow-popup md:w-1/3vw lg:w-1/4vw absolute mt-3 rounded-md bg-white p-3">
							<RadioGroup
								value={theme}
								onChange={setTheme}
								className="flex flex-col gap-4"
							>
								<RadioGroup.Label className="md-1 text-primary text-center text-lg font-bold">
									Themes
								</RadioGroup.Label>
								{themes.map((theme) => (
									<RadioGroup.Option
										key={theme.name}
										value={theme.value}
										className={`${theme.value} h-1/10vh bg-background outline-primary flex flex-row rounded-sm px-3 py-1 outline outline-2 outline-offset-1`}
									>
										{({ checked }) => (
											<>
												<div className="flex h-full w-2/3 flex-col items-start justify-center">
													<p className="text-primary text-lg font-bold">
														{theme.name}
													</p>
													<p className="text-text text-sm font-light">
														Text Example
													</p>
												</div>
												<div className="bg-secondary h-full w-1"></div>
												<div className="flex flex-1 items-center justify-center">
													{checked ? (
														<i className="bi bi-circle-fill text-primary text-2xl/[0]"></i>
													) : (
														<i className="bi bi-circle text-primary text-2xl/[0]"></i>
													)}
												</div>
											</>
										)}
									</RadioGroup.Option>
								))}
							</RadioGroup>
						</Popover.Panel>
					</Popover>
					<button
						className="aspect-square rounded-md p-2 outline outline-1 outline-white"
						onClick={() => setRevealSideNav((e) => !e)}
						id="filter-button"
					>
						<i
							className="bi bi-funnel-fill inline-block text-xl/[0] text-white md:text-2xl/[0]"
							id="filter-button"
						></i>
					</button>
				</div>
				<h1 className="text-5xl font-bold text-white">Card Shop</h1>
			</header>
			<ClickAwayListener
				onClickAway={(e) => {
					if (e.target.id === "filter-button") {
						return;
					}

					setRevealSideNav(false);
				}}
			>
				<div
					className={`h-sideBar transition-position absolute flex w-full flex-col px-7 py-4 duration-1000 md:w-1/2 lg:w-1/3 ${
						revealSideNav ? "left-0" : "-left-full"
					} border-b-3 border-r-3 border-primary bg-background text-text shadow-sideBar top-28 z-10 rounded-br-lg`}
				>
					<p className="text-primary flex h-12 w-full flex-shrink-0 justify-center text-center text-3xl font-bold">
						<i className="bi bi-funnel-fill mr-4 inline-block"></i>
						Filter
					</p>
					<Accordion.Root
						className="h-sideBarContent flex w-full flex-col gap-2"
						type="single"
						collapsible
					>
						<Accordion.Item
							value="1"
							className="data-open:h-0 data-open:flex-auto flex flex-col gap-1"
						>
							<Accordion.Trigger className="group flex flex-row items-center">
								<p className="text-primary text-2xl font-bold">Series</p>
								<i
									className={`bi bi-chevron-up text-primary duration-400 group-data-open:rotate-180 ml-auto text-2xl/[0] transition-transform`}
								></i>
							</Accordion.Trigger>
							<Accordion.Content className="flex flex-col gap-1 overflow-x-hidden overflow-y-scroll">
								{sets.map((set, index) => (
									<div className="flex h-fit w-11/12 flex-row items-center justify-between">
										<div className="flex flex-row items-center justify-between">
											<p className="text-primary text-base">{set}</p>
										</div>
										<button
											onClick={() => {
												if (setFilter.includes(set)) {
													setSetFilter(setFilter.filter((e) => e !== set));
												} else {
													setSetFilter([...setFilter, set]);
												}
											}}
										>
											<i
												className={`bi ${
													setFilter.includes(set)
														? "bi-check-square-fill"
														: "bi-square"
												} text-primary text-2xl/[0]`}
											></i>
										</button>
									</div>
								))}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item
							value="2"
							className="data-open:h-0 data-open:flex-auto flex flex-col gap-1"
						>
							<Accordion.Trigger className="group flex flex-row items-center">
								<p className="text-primary text-2xl font-bold">Rarity</p>
								<i
									className={`bi bi-chevron-up text-primary duration-400 group-data-open:rotate-180 ml-auto text-2xl/[0] transition-transform`}
								></i>
							</Accordion.Trigger>
							<Accordion.Content className="flex flex-col gap-1 overflow-x-hidden overflow-y-scroll">
								{raritiesSorted.map((rarity, index) => (
									<>
										<div className="flex h-fit w-11/12 flex-row items-center justify-between">
											<div className="flex flex-row items-center justify-between">
												<p className="text-primary text-base">{rarity}</p>
											</div>
											<button
												onClick={() => {
													if (rarityFilter.includes(rarity)) {
														setRarityFilter(
															rarityFilter.filter((e) => e !== rarity)
														);
													} else {
														setRarityFilter([...rarityFilter, rarity]);
													}
												}}
											>
												<i
													className={`bi ${
														rarityFilter.includes(rarity)
															? "bi-check-square-fill"
															: "bi-square"
													} text-primary text-2xl/[0]`}
												></i>
											</button>
										</div>
										{index === rarityFilter.length - 1 ? (
											<hr className="border-primary my-1 w-11/12" />
										) : (
											<></>
										)}
									</>
								))}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item
							value="3"
							className="data-open:h-0 data-open:flex-auto flex flex-col gap-1"
						>
							<Accordion.Trigger className="group flex flex-row items-center">
								<p className="text-primary text-2xl font-bold">Anime</p>
								<i
									className={`bi bi-chevron-up text-primary duration-400 group-data-open:rotate-180 ml-auto text-2xl/[0] transition-transform`}
								></i>
							</Accordion.Trigger>
							<Accordion.Content className="flex flex-col gap-2 overflow-y-scroll">
								<div className="bg-primary mt-1 flex w-11/12 flex-row items-center rounded-md pl-2">
									<i className="bi bi-search text-background text-center text-lg"></i>
									<input
										type="text"
										className="bg-primary text-background placeholder:text-background h-10 w-full rounded-md px-2 text-base placeholder:opacity-50 focus:outline-none"
										placeholder="Search"
										onChange={(e) => {
											console.log(e.target.value);
											setSeriesQuery(e.target.value);
										}}
									></input>
								</div>
								<hr className="border-primary my-1 w-11/12" />
								{animeSorted.map((anime, index) => (
									<>
										<div className="flex h-fit w-11/12 flex-row items-center justify-between">
											<div className="flex flex-row items-center justify-between">
												<p className="text-primary text-base">{anime}</p>
											</div>
											<button
												onClick={() => {
													if (seriesFilter.includes(anime)) {
														setSeriesFilter(
															seriesFilter.filter((e) => e !== anime)
														);
													} else {
														setSeriesFilter([...seriesFilter, anime]);
													}
												}}
											>
												<i
													className={`bi ${
														seriesFilter.includes(anime)
															? "bi-check-square-fill"
															: "bi-square"
													} text-primary text-2xl/[0]`}
												></i>
											</button>
										</div>
										{index ===
										seriesFilter.filter((x) =>
											x.toLowerCase().includes(seriesQuery.toLowerCase())
										).length -
											1 ? (
											<hr className="border-primary my-1 w-11/12" />
										) : (
											<></>
										)}
									</>
								))}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item
							value="4"
							className="data-open:h-auto data-open:gap-2 flex flex-col gap-1"
						>
							<Accordion.Trigger className="group flex flex-row items-center">
								<p className="text-primary text-2xl font-bold">Character</p>
								<i
									className={`bi bi-chevron-up text-primary duration-400 group-data-open:rotate-180 ml-auto text-2xl/[0] transition-transform`}
								></i>
							</Accordion.Trigger>
							<Accordion.Content className="flex flex-col gap-1">
								<div className="bg-primary flex w-11/12 flex-row items-center rounded-md pl-2">
									<i className="bi bi-search text-background text-center text-lg"></i>
									<input
										type="text"
										className="bg-primary text-background placeholder:text-background h-10 w-full rounded-md px-2 text-base placeholder:opacity-50 focus:outline-none"
										placeholder="Character"
										onChange={(e) => {
											setCharacterFilter(e.target.value);
										}}
									/>
								</div>
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item
							value="5"
							className="data-open:h-auto flex flex-col gap-1"
						>
							<Accordion.Trigger className="group flex flex-row items-center">
								<p className="text-primary text-2xl font-bold">Card No</p>
								<i
									className={`bi bi-chevron-up text-primary duration-400 group-data-open:rotate-180 ml-auto text-2xl/[0] transition-transform`}
								></i>
							</Accordion.Trigger>
							<Accordion.Content className="flex flex-col gap-1">
								<div className="bg-primary flex w-11/12 flex-row items-center rounded-md pl-2">
									<i className="bi bi-search text-background text-center text-lg"></i>
									<input
										type="text"
										className="bg-primary text-background placeholder:text-background h-10 w-full rounded-md px-2 text-base placeholder:opacity-50 focus:outline-none"
										placeholder="Card No"
										onChange={(e) => {
											setCardNoFilter(e.target.value);
										}}
									/>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>

					<div className="mb-4 flex h-12 w-11/12 flex-row gap-2">
						<button
							className="bg-primary text-background h-full w-1/2 rounded-md text-lg font-bold focus:outline-none"
							onClick={() => {
								filterCards();
							}}
						>
							Filter
						</button>
						<button
							className="bg-primary text-background h-full w-1/2 rounded-md text-lg font-bold focus:outline-none disabled:opacity-50"
							onClick={() => {
								resetFilters();
							}}
							disabled={
								seriesFilter.length === 0 &&
								characterFilter === "" &&
								cardNoFilter === "" &&
								rarityFilter.length === 0 &&
								setFilter.length === 0
							}
						>
							Reset
						</button>
					</div>
				</div>
			</ClickAwayListener>
			<main className="z-0 grid h-fit w-11/12 grid-cols-2 grid-rows-5 gap-5 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{filteredCards.map((card, index) => {
					return <Card key={index} cardDetails={card} />;
				})}
			</main>
			<div className="block" ref={observee}></div>
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

		<main className="bg-card-bg relative flex aspect-potrait w-full flex-col gap-2.5 overflow-hidden rounded pb-5 pl-5 pr-5 pt-5 shadow-card">
			{image === null ? (
				<div className="z-0 aspect-card w-full bg-gray-200"></div>
			) : (
				<img
					src={image}
					alt={name}
					className="z-0 aspect-card w-full object-cover"
					loading="lazy"
				/>
			)}
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				<p className="text-md text-text h-fit w-full text-ellipsis text-center font-bold">
					{name}
				</p>
				<p className="text-text h-fit w-full text-ellipsis text-center text-sm font-light">
					{animeName}
				</p>
			</div>
			<div className="left-rarity h-1/9 bg-gold/[0.9] absolute top-8 flex w-full -rotate-45 items-center justify-center">
				<p className="text-3xl font-bold text-white">{rarity}</p>
			</div>
		</main>
	);
}
