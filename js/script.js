/** Faktura -- v 1.1 -- Copyright (c) 2016 Axel Smeets */

function tryRegexExec(str, regex) {
	var res = regex.exec(str)
	if (res)
		return res[0]
	else
		return undefined
}

function parseNumber(str) {
	return parseFloat(tryRegexExec(str, /[0-9\.\,]+/g) || 0)
}

function parsePriceCurrency(str) {
	return tryRegexExec(str, /[^0-9\.\,]+/g) || ''
}

function formatNumber(nbr) {
	return nbr.toFixed(2)
}

function formatValue(nbr, curr, after) {
	if (after)
		return formatNumber(nbr) + curr
	else
		return curr + formatNumber(nbr)
}

function $(query) {
	return document.querySelector(query)
}

function calcRow(row) {
	var children = row.childNodes

	var qty = children[2].textContent
	var price = children[3].textContent

	return parseNumber(qty) * parseNumber(price)
}

function recalcRow(evt) {
	var children = this.parentNode.childNodes
	//var item = children[1]
	var price = children[3].textContent
	var total = children[4]
	var curr = parsePriceCurrency(price)

	var cost = calcRow(this.parentNode)

	total.textContent = formatValue(cost, curr, price.indexOf(curr))
}

function recalcTotal(evt) {
	var list = $('#table-body')
	var rows = list.childNodes
	var subtotal = 0
	var curr = ''
	var after = false

	for (var i = 0; i < rows.length; i++) {
		var price = rows[i].childNodes[3].textContent
		curr = curr || parsePriceCurrency(price)
		after = price.indexOf(curr) > 0

		subtotal += calcRow(rows[i])
	}


	var vat = parseNumber($('#vats').textContent) * 0.01
	var total = subtotal + subtotal * vat

	$('#subtotal').textContent = formatValue(subtotal, curr, after)
	if (vat != 0.0)
		$('#vat').parentNode.classList.remove('hidden')
	else
		$('#vat').parentNode.classList.add('hidden')
	$('#vat').textContent = formatValue(subtotal*vat, curr, after)
	$('#total').textContent = formatValue(total, curr, after)
}

function remove(evt) {
	this.parentNode.parentNode.removeChild(this.parentNode)
	recalcTotal()
}

function makeButton(glyph, side, handler) {
	var btn = el('div.relative-' + side + '.hidden-print', [
		el('button.btn.btn-default.btn-xs', [
			el('i.glyphicon.glyphicon-' + glyph)
		])
	])
	btn.addEventListener('click', handler, false)
	return btn
}

function makeItemField(div, editable, dorecalc) {
	var field = el(div, ['000'])

	if (editable)
		field.setAttribute('contenteditable', 'true')

	if (dorecalc) {
		field.addEventListener('keyup', recalcRow, false)
		field.addEventListener('focusout', recalcTotal, false)
	}

	return field
}

function add() {
	$('#table-body').appendChild(
		el('div.row', [
			makeButton('minus', 'left', remove),
			makeItemField('div.col-xs-5', true, false),
			makeItemField('div.col-xs-2.text-right', true, true),
			makeItemField('div.col-xs-2.text-right', true, true),
			makeItemField('div.col-xs-3.text-right', false, false),
			makeButton('refresh', 'right', recalcRow)
		])
	)
}

function storableFields() {
	return [
		'#label-mycompany',
		'#label-yourcompany',
		'#label-contractor',
		'#label-contractee',
		'#label-myreference',
		'#label-yourreference',
		'#label-total',
		'#label-subtotal',
		'#label-vat',
		'#label-account',
		'#label-receiver',
		'#label-footer',
		'#vats'
	]
}

function save(evt) {
	storableFields().forEach(function(id) {
		window.localStorage[id] = $(id).innerHTML
	})
}

function load(evt) {
	storableFields().forEach(function(id) {
		$(id).innerHTML = window.localStorage[id]
	})
}

window.onload = function() {
	$('#add').addEventListener('click', add, false)

	$('#vats').addEventListener('keyup', recalcTotal, false)

	$('#print').addEventListener('click', function(){window.print()}, false)

	$('#save').addEventListener('click', save, false)
	$('#load').addEventListener('click', load, false)

	recalcTotal()
}