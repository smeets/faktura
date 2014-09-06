/** Faktura -- v 1.0 -- Copyright (c) 2014 Axel Smeets */

var currentItemId = 0

// Does not return a string!
function formatValue(value) {
	var fixed = value.toFixed(2)

	if (fixed > 1000) {
		var thousands = Math.floor(fixed / 1000),
		hundreds = fixed - thousands * 1000

		if (hundreds < 100)
			if (hundreds < 10)
				hundreds = "00" + hundreds
			else
				hundreds = "0" + hundreds

		fixed = thousands + " " + hundreds
	}

	return fixed
}

function calculateTotal(){
	var vat = parseInt($("#vat").text().replace("%", "")),
		sum = 0
		
	for (var i = 0; i < currentItemId; i++) {
		sum += parseInt( $("#item-" + i + "-total").text().replace(" ", "") )
	}

	$("#sum").text(formatValue(sum))
	$("#grand-total").text(formatValue(sum + sum * vat * 0.01) + " " + $("#currency").val())
}

$("#print").on('click', function (e) {
	window.print()
})

$("#add-item").on('click', function (e) {
	var id = currentItemId++

	var div = $("<div>").addClass("row extra-space").attr("id", "item-" + id),
		art = $("<p>").addClass("col-md-11 col-xs-11").text("artikel").attr("contenteditable", "true"),
		units = $("<p>").addClass("col-md-3 col-xs-3").text("1").attr("contenteditable", "true")
				.attr("id", "item-" + id + "-units"),
		unit = $("<p>").addClass("col-md-3 col-xs-3").text("st").attr("contenteditable", "true"),
		price = $("<p>").addClass("col-md-3 col-xs-3").text("0").attr("contenteditable", "true")
				.attr("id", "item-" + id + "-price"),
		total = $("<p>").addClass("col-md-3 col-xs-3").text("0").attr("id", "item-" + id + "-total"),
		remove = $("<span>").addClass("glyphicon glyphicon-minus btn btn-xs btn-danger no-print remove col-xs-1")

	div.append(remove, art, units, unit, price, total)
	
	remove.on('click', function (e) {
		div.remove()

		// Shift newer items down a notch
		for (var i = id + 1; i < currentItemId; i++) {
			var elem = $("#item-" + i)
			if (elem) {
				$("#item-" + i + "-units").attr("id", "item-" + ( i - 1) + "-units")
				$("#item-" + i + "-price").attr("id", "item-" + ( i - 1) + "-price")
				$("#item-" + i + "-total").attr("id", "item-" + ( i - 1) + "-total")
			}
		}

		currentItemId -= 1
	})

	units.focusout(function (e) {
		total.text( formatValue(parseInt(units.text()) * parseInt(price.text())) )
		calculateTotal()
	})

	price.focusout(function (e) {
		total.text( formatValue(parseInt(units.text()) * parseInt(price.text())) )
		calculateTotal()
	})

	$("#items").append(div)
})