var posting = true;

$(document).ready(function(){

	var h1,h2;
	h1 = $(".header_div").outerHeight();
	h2 = $("footer").outerHeight();
	console.log('header height',h1 + 10);
	console.log('footer height',h2);
	$("#wrap").css({top:h1});

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
		$.get("/visual?name="+name+"&seriel="+seriel+"", function(reply){
			alert(reply.message);
		});
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
				else if(result.status === 0){
					posting = true;
					alert(result.info[0].message);
				}
				else{
					posting = true;
					var __htmls, seriel = '', presence, len;

					$(".row").empty();
					for(var i = 0; i < result.info.length; i++){
						if(result.info[i].presence === 1)
							presence = "Present";
						else
							presence = "Not Present";
						
						len = result.info[i].seriel.length;
						for(var j = 1; j <= len; j++){
							if(j > len - 4)
								seriel += result.info[i].seriel[j];
							else
								seriel += 'x';
						}
						__htmls = '<div class="col-xl-3">'+
									'<div class="card" style="width: 18rem;">'+
									  '<img class="card-img-top" src="./view/profile.png" alt="Card image cap">'+
									    '<div class="card-body">'+
									      '<h5 class="card-title">'+result.info[i].name+'</h5>'+
									      '<p class="card-text">Card Seriel: '+seriel+'</p>'+
									      '<p class="card-text">Status: '+presence+'</p>'+
									  '</div>'+
									'</div>'+
								'</div>';
						$(".row").append(__htmls);
					}
				}
			});
		}
	}
});