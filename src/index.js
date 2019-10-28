// CSS, which should get injected as a style or extracted with min in prod
import 'dc/dc.css';
import './index.css';

import Papa from 'papaparse';
import dc from 'dc';
import crossfilter from 'crossfilter2';
import * as d3 from 'd3';

console.debug({ dc, crossfilter, d3 })
dc.config.defaultColors(d3.schemeCategory10);

// Templates with pug
import pugTpl from './main.tpl.pug';
const elt = document.createElement('div');
elt.innerHTML = pugTpl();
document.body.appendChild(elt);

const attributes = ['Recovery', 'Resilience', 'Strength', 'Intellect', 'Mobility', 'Discipline'];
const desc = ['Power', 'Total', 'Type', 'Equippable', 'Name'];
const classItem = new Set(['Titan Mark', 'Warlock Bond', 'Hunter Cloak']);

const displayResults = (results) => {
	// Clear everything
	dc.chartRegistry.clear();

	const dims = crossfilter(results);

	const typeDim = dims.dimension(x => {
		if (classItem.has(x.Type)) {
			return 'Class Item';
		}
		return x.Type;
	});
	const classDim = dims.dimension(x => x.Equippable);
	const powerDim = dims.dimension(x => +x.Power);

	dc.dataTable('.data-table')
		.columns(desc.concat(attributes))
		.size(Infinity)
		.dimension(powerDim);

	dc.barChart('.type-bars')
		.width(600)
		.x(d3.scaleBand().domain(['Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor', 'Class Item']))
		.xUnits(dc.units.ordinal)
		.xAxisLabel('Armor Type')
		.yAxisLabel('Count')
		.barPadding(0.1)
		.outerPadding(0.5)
		.elasticY(true)
		.dimension(typeDim)
		.group(typeDim.group().reduceCount());

	dc.barChart('.class-bars')
		.x(d3.scaleBand().domain(['Warlock', 'Titan', 'Hunter']))
		.xUnits(dc.units.ordinal)
		.xAxisLabel('Class')
		.yAxisLabel('Count')
		.barPadding(0.1)
		.outerPadding(0.5)
		.elasticY(true)
		.dimension(classDim)
		.group(classDim.group().reduceCount());

	// Make attribute histograms
	d3.select('.attributes')
		.selectAll('div')
		.data(attributes)
		.join('div')
		.each(function(attr) {
			d3.select(this).classed(`${attr.toLowerCase()}-bars chart`, true);
		});

	const attrMax = dims.allFiltered().reduce((acc, x) => {
		return Math.max(acc, ...attributes.map(attr => x[attr]));
	}, 0);
	attributes.forEach(attr => {
		const attrDim = dims.dimension(x => +x[attr]);
		const attrScale = d3.scaleLinear().domain([0, attrMax]).nice();
		dc.barChart(`.${attr.toLowerCase()}-bars`)
			.x(attrScale)
			.xAxisLabel(attr)
			.dimension(attrDim)
			.elasticY(true)
			.group(attrDim.group().reduceCount());
	});

	dc.renderAll();
};

document.getElementById('file-input').addEventListener('input', (e) => {
	if (e.target.files.length) {
		Papa.parse(e.target.files[0], {
			header: true,
			dynamicTyping: true,
			complete(results) {
				displayResults(results.data);
			},
		});
	}
});

// Small sample
displayResults([
	{"Recovery":7,"Resilience":7,"Strength":6,"Intellect":6,"Mobility":12,"Discipline":15,"Power":948,"Total":53,"Type":"Helmet","Equippable":"Titan","Name":"Substitutional Alloy Helm"},
	{"Recovery":13,"Resilience":7,"Strength":10,"Intellect":6,"Mobility":6,"Discipline":6,"Power":928,"Total":48,"Type":"Helmet","Equippable":"Titan","Name":"One-Eyed Mask"},
	{"Recovery":6,"Resilience":6,"Strength":10,"Intellect":9,"Mobility":10,"Discipline":7,"Power":949,"Total":48,"Type":"Helmet","Equippable":"Titan","Name":"Mimetic Savior Helm"},
	{"Recovery":12,"Resilience":8,"Strength":6,"Intellect":12,"Mobility":6,"Discipline":6,"Power":950,"Total":50,"Type":"Helmet","Equippable":"Titan","Name":"Phoenix Strife Type 0"},
	{"Recovery":13,"Resilience":6,"Strength":13,"Intellect":2,"Mobility":8,"Discipline":14,"Power":948,"Total":56,"Type":"Helmet","Equippable":"Titan","Name":"Prodigal Helm"},
	{"Recovery":12,"Resilience":7,"Strength":7,"Intellect":17,"Mobility":7,"Discipline":2,"Power":947,"Total":52,"Type":"Leg Armor","Equippable":"Titan","Name":"Prodigal Greaves"},
	{"Recovery":9,"Resilience":7,"Strength":7,"Intellect":8,"Mobility":14,"Discipline":15,"Power":923,"Total":60,"Type":"Leg Armor","Equippable":"Titan","Name":"Peacekeepers"},
	{"Recovery":6,"Resilience":13,"Strength":13,"Intellect":14,"Mobility":6,"Discipline":2,"Power":947,"Total":54,"Type":"Leg Armor","Equippable":"Titan","Name":"Tangled Web Greaves"},
	{"Recovery":16,"Resilience":2,"Strength":11,"Intellect":6,"Mobility":6,"Discipline":7,"Power":950,"Total":48,"Type":"Leg Armor","Equippable":"Titan","Name":"Mimetic Savior Greaves"},
	{"Recovery":2,"Resilience":17,"Strength":12,"Intellect":2,"Mobility":8,"Discipline":12,"Power":950,"Total":53,"Type":"Leg Armor","Equippable":"Titan","Name":"Mimetic Savior Greaves"},
	{"Recovery":10,"Resilience":10,"Strength":10,"Intellect":5,"Mobility":1,"Discipline":5,"Power":750,"Total":41,"Type":"Gauntlets","Equippable":"Titan","Name":"Notorious Reaper Gauntlets"},
	{"Recovery":0,"Resilience":20,"Strength":5,"Intellect":10,"Mobility":1,"Discipline":5,"Power":750,"Total":41,"Type":"Gauntlets","Equippable":"Titan","Name":"Notorious Collector Gauntlets"},
	{"Recovery":0,"Resilience":21,"Strength":5,"Intellect":10,"Mobility":0,"Discipline":5,"Power":750,"Total":41,"Type":"Helmet","Equippable":"Titan","Name":"Solstice Helm (Majestic)"},
	{"Recovery":10,"Resilience":2,"Strength":6,"Intellect":12,"Mobility":10,"Discipline":6,"Power":750,"Total":46,"Type":"Helmet","Equippable":"Titan","Name":"Solstice Helm (Majestic)"},
	{"Recovery":1,"Resilience":2,"Strength":15,"Intellect":10,"Mobility":0,"Discipline":5,"Power":750,"Total":33,"Type":"Gauntlets","Equippable":"Titan","Name":"Ashen Wake"},
	{"Recovery":20,"Resilience":10,"Strength":10,"Intellect":5,"Mobility":2,"Discipline":5,"Power":750,"Total":52,"Type":"Leg Armor","Equippable":"Warlock","Name":"Wing Theorem"},
	{"Recovery":0,"Resilience":0,"Strength":0,"Intellect":0,"Mobility":0,"Discipline":0,"Power":750,"Total":0,"Type":"Warlock Bond","Equippable":"Warlock","Name":"Wing Theorem"},
	{"Recovery":0,"Resilience":0,"Strength":0,"Intellect":0,"Mobility":0,"Discipline":0,"Power":750,"Total":0,"Type":"Warlock Bond","Equippable":"Warlock","Name":"Vigil of Heroes"},
	{"Recovery":20,"Resilience":0,"Strength":10,"Intellect":5,"Mobility":2,"Discipline":5,"Power":750,"Total":42,"Type":"Leg Armor","Equippable":"Warlock","Name":"Annealed Shaper Boots"},
	{"Recovery":0,"Resilience":0,"Strength":0,"Intellect":0,"Mobility":0,"Discipline":0,"Power":750,"Total":0,"Type":"Warlock Bond","Equippable":"Warlock","Name":"Opulent Scholar Bond"},
]);