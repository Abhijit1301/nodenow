$(document).ready(function(){
	$("#myForm").on("submit",function(e){
		$("#myModal").modal('hide');
	});

	setInterval(repeatedAjax,3000);

	function repeatedAjax(){
		$.post("/visual",function(result){
			console.log(result);
			//result = JSON.parse(result);
			if(result.status === 1){
				$("#seriel").val(result.seriel);
				$("#myModal").modal('show');
			}
		});
	}
});