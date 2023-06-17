"use client";

import { useEffect, useState, useRef } from "react";
import Axios from "axios";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Popover, RadioGroup, Combobox } from "@headlessui/react";
import { ClickAwayListener } from "@mui/base";
import { themes, sets, rarities } from "./values";

export default function Home() {
	const [data, setData] = useState([]);
	const [cardDetails, setCardDetails] = useState([]);
	const [amountLoaded, setAmountLoaded] = useState(12);
	const [isLastCardIntersecting, setIsLastCardIntersecting] = useState(false);
	const [theme, setTheme] = useState(
		localStorage.getItem("theme") || "theme-blue"
	);
	const [revealSideNav, setRevealSideNav] = useState(false);
	const [accordianPanel, setAccordianPanel] = useState(0);
	const [setFilter, setSetFilter] = useState([]);
	const [rarityFilter, setRarityFilter] = useState([]);
	const [seriesFilter, setSeriesFilter] = useState([]);
	const [characterFilter, setCharacterFilter] = useState("");
	const [cardNoFilter, setCardNoFilter] = useState("");

	const sortedRarities = () => {
		let selectedRarities = [];
		for (let i = 0; i < rarities.length; i++) {
			if (rarityFilter.includes(rarities[i])) {
				selectedRarities.push(rarities[i]);
			}
		}
		if (selectedRarities.length === 0) return rarities;
		return [
			...selectedRarities,
			...rarities.filter((x) => !selectedRarities.includes(x)),
		];
	};

	const [raritiesSorted, setRaritiesSorted] = useState(sortedRarities());

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
				rootMargin: "500px",
				threshold: 1.0,
			}
		);

		observer.observe(observee.current);

		return () => {
			observer.disconnect();
		};
	}, [observee, cardDetails]);

	useEffect(() => {
		// Load more cards
		if (isLastCardIntersecting) {
			setAmountLoaded(amountLoaded + 7);
			setIsLastCardIntersecting(false);
		}
	}, [isLastCardIntersecting]);

	useEffect(() => {
		// Get theme from local storage
		const theme = localStorage.getItem("theme");
		if (theme === null) {
			localStorage.setItem("theme", "theme-blue");
		} else {
			// mainBody.current.classList.replace(RegExp('/(?:^|\s)theme-(?:\w*)'), theme);
			setWebsiteTheme(theme);
		}
	}, []);

	useEffect(() => {
		setRaritiesSorted(sortedRarities());
	}, [rarityFilter]);

	useEffect(() => {
		// Set theme to local storage
		localStorage.setItem("theme", theme);
		setWebsiteTheme(theme);
	}, [theme]);

	return (
		<body
			ref={mainBody}
			className="theme-blue flex w-full flex-col items-center bg-background"
		>
			<header className="z-20 flex h-28 w-full flex-row items-center justify-center bg-primary">
				<div
					id="control-panel"
					className="absolute left-1/24 top-14 flex h-fit w-fit -translate-y-1/2 gap-8"
				>
					<Popover className="relative">
						<Popover.Button className="aspect-square rounded-md p-2 outline outline-1 outline-white">
							<i className="bi bi-palette2 inline-block text-2xl/[0] text-white"></i>
						</Popover.Button>
						<Popover.Panel className="absolute mt-3 w-1/7vw rounded-md bg-white p-3 shadow-popup">
							<RadioGroup
								value={theme}
								onChange={setTheme}
								className="flex flex-col gap-4"
							>
								<RadioGroup.Label className="md-1 text-center text-lg font-bold text-primary">
									Themes
								</RadioGroup.Label>
								{themes.map((theme) => (
									<RadioGroup.Option
										key={theme.name}
										value={theme.value}
										className={`${theme.value} flex h-1/15vh flex-row rounded-sm bg-background px-3 py-1 outline outline-2 outline-offset-1 outline-primary`}
									>
										{({ checked }) => (
											<>
												<div className="flex h-full w-2/3 flex-col items-start justify-center ">
													<p className="text-lg font-bold text-primary">
														{theme.name}
													</p>
													<p className="text-sm font-light text-text">
														Text Example
													</p>
												</div>
												<div className="h-full w-1 bg-secondary"></div>
												<div className="flex flex-1 items-center justify-center">
													{checked ? (
														<i className="bi bi-circle-fill text-2xl/[0] text-primary"></i>
													) : (
														<i className="bi bi-circle text-2xl/[0] text-primary"></i>
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
							className="bi bi-funnel-fill inline-block text-2xl/[0] text-white"
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
					className={`absolute flex h-sideBar w-1/6 flex-col px-7 py-4 transition-position duration-1000 ${
						revealSideNav ? "left-0" : "-left-1/4"
					} top-28 z-10 rounded-br-lg border-b-3 border-r-3 border-primary bg-background text-text shadow-sideBar`}
				>
					<p className="h-18 w-full text-center text-3xl font-bold text-primary">
						<i className="bi bi-funnel-fill mr-4 inline-block"></i>
						Filter
					</p>
					<div
						id="accordian"
						className="flex h-full w-full flex-col items-start"
					>
						<div
							id="accordian-panel"
							className={`${
								accordianPanel == 1 ? "mb-12 h-1/3" : " mb-0 h-1/15"
							} w-full transition-accordian duration-500`}
						>
							<button
								id="accordian-button"
								className="flex w-full flex-row items-center justify-between"
								onClick={() => setAccordianPanel((e) => (e == 1 ? 0 : 1))}
							>
								<p className="text-2xl font-bold text-primary">Set</p>
								<i
									className={`bi ${
										accordianPanel == 1 ? "bi-chevron-up" : "bi-chevron-down"
									} text-2xl/[0] text-primary`}
								></i>
							</button>
							<div
								id="accordian-content"
								className={`grid ${
									accordianPanel == 1 ? "grid-rows-1" : "grid-rows-0"
								} h-full w-full gap-2 overflow-hidden transition-template-rows duration-500`}
							>
								<div
									id="accordian-inner"
									className="h-full w-full overflow-hidden"
								>
									<div className="flex h-full flex-col gap-1 overflow-y-scroll">
										{sets.map((set, index) => (
											<div className="flex w-11/12 flex-row items-center justify-between">
												<div className="flex flex-row items-center justify-between">
													<p className="text-base text-primary">{set}</p>
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
														} text-2xl/[0] text-primary`}
													></i>
												</button>
											</div>
										))}
									</div>
								</div>
								<hr className="w-full rounded-md border-t-1 border-text opacity-50"></hr>
							</div>
						</div>
						<div
							id="accordian-panel"
							className={`${
								accordianPanel == 2 ? "mb-12 h-1/3" : " mb-0 h-1/15"
							} w-full transition-accordian duration-500`}
						>
							<button
								id="accordian-button"
								className="flex w-full flex-row items-center justify-between"
								onClick={() => setAccordianPanel((e) => (e == 2 ? 0 : 2))}
							>
								<p className="text-2xl font-bold text-primary">Rarity</p>
								<i
									className={`bi ${
										accordianPanel == 2 ? "bi-chevron-up" : "bi-chevron-down"
									} text-2xl/[0] text-primary`}
								></i>
							</button>
							<div
								id="accordian-content"
								className={`grid ${
									accordianPanel == 2 ? "grid-rows-1" : "grid-rows-0"
								} h-full w-full gap-2 transition-template-rows duration-500`}
							>
								<div
									id="accordian-inner"
									className="h-full w-full overflow-hidden"
								>
									<div className="flex h-full flex-col gap-1 overflow-y-scroll">
										{raritiesSorted.map((rarity, index) => (
											<div className="flex w-11/12 flex-row items-center justify-between">
												<div className="flex flex-row items-center justify-between">
													<p className="text-base text-primary">{rarity}</p>
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
														} text-2xl/[0] text-primary`}
													></i>
												</button>
											</div>
										))}
									</div>
								</div>
								<hr className="w-full rounded-md border-t-1 border-text opacity-50"></hr>
							</div>
						</div>
					</div>
				</div>
			</ClickAwayListener>
			<main className="z-0 grid h-fit w-11/12 grid-cols-6 grid-rows-5 gap-5 py-3">
				{data.map((_, index) => {
					return index === amountLoaded - 1 ? (
						<div ref={observee}>
							<Card key={index} cardDetails={cardDetails[index]} />
						</div>
					) : (
						<Card key={index} cardDetails={cardDetails[index]} />
					);
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

		<main className="relative flex aspect-potrait w-full flex-col gap-2.5 overflow-hidden rounded bg-card-bg pb-5 pl-5 pr-5 pt-5 shadow-card">
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
				<p className="h-fit w-full text-ellipsis text-center text-md font-bold text-text">
					{name}
				</p>
				<p className="h-fit w-full text-ellipsis text-center text-sm font-light text-text">
					{animeName}
				</p>
			</div>
			<div className="absolute left-rarity top-8 flex h-1/9 w-full -rotate-45 items-center justify-center bg-gold/[0.9]">
				<p className="text-3xl font-bold text-white">{rarity}</p>
			</div>
		</main>
	);
}
