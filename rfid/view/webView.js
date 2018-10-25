$(document).ready(function(){
	$("#myForm").on("submit",function(e){
		$("#myModal").modal('hide');
		var name = $("#name").val();
		var seriel = $("#seriel").val();
		$.get("/visual?name="+name+"&seriel="+seriel+"");
		e.preventDefault();
	});

	setInterval(repeatedAjax,3000);

	function repeatedAjax(){
		$.post("/visual",function(result){
			console.log(result);
			//result = JSON.parse(result);
			if(result.status === 1 && result.info.length > 0){
				$("#seriel").val(result.info[0].seriel);
				$("#myModal").modal('show');
			}
		});
	}
});