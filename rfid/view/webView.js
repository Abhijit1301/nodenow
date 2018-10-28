var posting = true;

$(document).ready(function(){
	$("input[name=add_or_not]").on("input",function(){
		console.log('radio accessible');
		var selValue = $('input[name=add_or_not]:checked').val();
		console.log('printing selValue on radio input',selValue);
		if(selValue === "2"){
			$("#name").prop('readonly',true);
			$(".btn-block").text("Don't Add Me");
		}
		else{
			$("#name").prop('readonly',false);
			$(".btn-block").text("Add Me");
		}
	});

	$("#myForm").on("submit",function(e){
		posting = true;
		$("#myModal").modal('hide');
		var selValue = $('input[name=add_or_not]:checked').val();
		console.log('radio accessible',selValue);
		var name = $("#name").val();
		var seriel = $("#seriel").val();

		if(selValue === "2")
			name = "donotadd";
		$.get("/visual?name="+name+"&seriel="+seriel+"");
		e.preventDefault();
	});

	setInterval(repeatedAjax,1000);

	function repeatedAjax(){
		if(posting){
			posting = false;
			$.post("/visual",function(result){
				console.log(result);
				//result = JSON.parse(result);
				if(result.status === 1 && result.info.length > 0){
					$("#seriel").val(result.info[0].seriel);
					$("#myModal").modal('show');
				}
			});
		}
	}
});