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
	var vat = 0,
		sum = 0
		
	for (var i = 0; i < currentItemId; i++) {
		sum += parseInt( $("#item-" + i + "-total").text().replace(" ", "") )
	}

	if ($("#vat-enabled").attr('checked')) {
		vat = sum * parseInt($("#vat-amount").val().replace("%", "")) * 0.01
		$("#vat-2").text(formatValue(vat))
	} 

	$("#sum").text(formatValue(sum))
	$("#grand-total").text(formatValue(sum + vat) + " " + $("#currency").val())
}

// Grab stuff from invoice and put it in local storage
$("#store").click(function () {
	if (window.localStorage) {
		// Store the actual html markup
		localStorage['contractor'] = $("#contractor").html()

		// Store VAT settings
		localStorage['vat-enabled'] = $("#vat-enabled").attr('checked')
		localStorage['vat-amount'] = $("#vat-amount").val()

		// Store invoice header && footer
		localStorage['faktura-header'] = $("#faktura-header").html()
		localStorage['faktura-footer'] = $("#faktura-footer").html()

		// Store page footer
		localStorage['footer'] = $("#footer").html()
	} else {
		console.log("browser does not support :((")
	}

	$('#storemodal').modal('hide')
})

// Grab stuff from local storage and put it in invoice
$("#load").click(function () {
	if (window.localStorage) {
		$("#contractor").html(localStorage['contractor'])
		$("#vat-enabled").attr('checked', localStorage['vat-enabled'])
		$("#vat-amount").val(localStorage['vat-amount'])
		$("#faktura-header").html(localStorage['faktura-header'])
		$("#faktura-footer").html(localStorage['faktura-footer'])
		$("#footer").html(localStorage['footer'])
	} else {
		console.log("browser does not support :((")
	}

	$('#loadmodal').modal('hide')
})

$("#vat-amount").focusout(function () {
	var text = $("#vat-1").text()

	if (text.indexOf("(") >= 0 && text.indexOf(")") >= 0) {
		$("#vat-1").text(text.substr(0, text.indexOf("(")) + "(" + $('#vat-amount').val() + "%)")
	}

	calculateTotal()
})

$("#vat-enabled").change(function () {
	$("#vat-1").toggle()
	$("#vat-2").toggle()
	calculateTotal()
})

$("#currency").focusout(function () {
	calculateTotal()
})

$("#print").click(function () {
	// Hack the shiet out of the element 8D
	document.querySelector('style').textContent +=
  		"@media print { #footer { margin-top: calc(298mm - 4mm - " + $("#footer").offset().top + "px - " + $("#footer").height() * 2 + "px); }}"
	window.print()
})

$("#add-item").click(function () {
	var id = currentItemId++

	var div = $("<div>").addClass("row").attr("id", "item-" + id),
		art = $("<p>").addClass("col-xs-10 extra-space").text("artikel").attr("contenteditable", "true"),
		units = $("<p>").addClass("col-xs-3").text("1").attr("contenteditable", "true")
				.attr("id", "item-" + id + "-units"),
		unit = $("<p>").addClass("col-xs-3").text("st").attr("contenteditable", "true"),
		price = $("<p>").addClass("col-xs-3").text("0").attr("contenteditable", "true")
				.attr("id", "item-" + id + "-price"),
		total = $("<p>").addClass("col-xs-3").text("0").attr("id", "item-" + id + "-total"),
		remove = $("<span>").addClass("glyphicon glyphicon-minus btn btn-xs btn-danger no-print remove col-xs-1")

	div.append(remove, art, units, unit, price, total)
	
	remove.click(function () {
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

// Initialize
calculateTotal()