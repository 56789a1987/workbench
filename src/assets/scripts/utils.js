function compileComposer(text) {
	return eval("(function(t) { return "
		+ text.replace(/sin|cos|tan|floor|ceil/g, str => "Math." + str).replace(/Math.Math./g, 'Math.')
		+ " })");
}
