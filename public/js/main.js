(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);






// ------------------multiple ------------------
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

const user = JSON.parse(getCookie('user'));
var sender_id = user._id ;
var receiver_id; 
var socket = io('/user-namespace', {
	auth: {
		token: user._id
	}
});

$(document).ready(() => {
	$('.user-list').click((event) => {
		var userId = $(event.currentTarget).attr("data-id");
		receiver_id = userId
		$('.start-head').hide();
		$('.chat-section').show();

		socket.emit('existCaht', { sender_id: sender_id, receiver_id: receiver_id })
	});
});

socket.on('getUserOnline', (data) => {
	$(`#${data.user_id}-status`).removeClass('d-none').addClass('d-block');
});

socket.on('getUserOffline', (data) => {
	$(`#${data.user_id}-status`).removeClass('d-block').addClass('d-none');
});

$('#chat-form').submit((e) => {
	e.preventDefault();
	var message = $('#message').val();
	$.ajax({
		url: '/saveChat',
		type: 'POST',
		data: {
			sender_id: sender_id,
			receiver_id: receiver_id,
			message: message
		},
		success: (res) => {
			if (res.success) {
				$('#message').val('');
				var chat = res.data.message;
				var html = `
				<div class="current-user-chat">
					<div class="chat-box ml-2" id=${res.data._id}>
						<h6>${chat}
							<i class="fa fa-trash mx-1" aria-hidden="true" data-id="${res.data._id}" data-bs-toggle="modal" data-bs-target="#deleteModel"></i>
						</h6>
					</div>
				</div>
				`;
				$('#chat-container').append(html);
				scrollChat()
				socket.emit('newChat', res.data)
			} else {
				alert(data.msg)
			}
		}
	})
})

socket.on("loadNewChat", (data) => {
	if (sender_id == data.receiverId && receiver_id == data.senderId) {
		var html = `
		<div class="distance-user-chat">
			<div class="chat-box mx-1 mr-2" id=${data._id}>
				<h6>
					${data.message}
				</h6>
			</div>
		</div>
			`;
		$('#chat-container').append(html);
	}
	scrollChat()
})

socket.on("loadOldChat", (data) => {
	$('#chat-container').html('');
	const chats = data.chats
	let html = '';
	chats.forEach(chat => {
		let addClass = ''
		if (sender_id == chat.senderId) {
			// addClass = 'current-user-chat'
			html += `
			<div class="current-user-chat">
				<div class="chat-box" id=${chat._id}>
					<h6>${chat.message}
						<i class="fa fa-trash mx-1" aria-hidden="true" data-id="${chat._id}" data-bs-toggle="modal" data-bs-target="#deleteModel"></i>
					</h6>
				</div>
			</div>
			`
		} else {
			// addClass = 'distance-user-chat'
			html += `
			<div class="distance-user-chat ">
				<div class="chat-box mx-1" id=${chat._id}>
					<h6>
						${chat.message}
					</h6>
				</div>
			</div>
			`
		}

	});
	$('#chat-container').append(html);
	scrollChat()
})

function scrollChat() {
	$('#chat-container').animate({
		scrollTop: $('#chat-container').get(0).scrollHeight
	}, 0);
}

$(document).on('click','.fa-trash',function(){
	let msg = $(this).parent().text();
	$('#delete-message').text(msg)
	$('#delete-message-id').val($(this).attr('data-id'))
})


$("#delete-chat-form").submit((e)=>{
	e.preventDefault();
	let id = $('#delete-message-id').val();
	$.ajax({
		url: '/deleteChat',
		type: 'POST',
		data: {
			id: id
		},
		success: (res) => {
			if (res.success) {
				$(`#${id}`).remove();
				$('#deleteModel').modal('hide');
				socket.emit('chatDelete',id)
			} else {
				alert(data.msg)
			}
		}
	})
})

socket.on('deleteChatMessage',(id)=>{
	$(`#${id}`).remove();
})

// add members js 
$('.addMember').click(function(){
	var id = $(this).attr('data-id')
	var limit = $(this).attr('data-limit')

	$("#group_id").val(id)
	$("#group_limit").val(limit)

	$.ajax({
		url: '/getMembers',
		type: 'POST',
		data: {
			group_id: id
		},
		success: (res) => {
			if (res.success) {
				let users = res.data
				let html = ``;

				users.map((v,i)=>{
					let isMemberOfGroup = v.members.length > 0?true:false;
					html += `
						<tr>
							<td><input type="checkbox" ${(isMemberOfGroup?"checked":"")} name="members[]" value="${v._id}"/></td>
							<td>${v.name}</td>
						</tr>
					`
				})
				$('.addMemberInTable').html(html)
			} else {
				alert(data.msg)
			}
		}
	})
})

// add members 
$("#add-member-form").submit(function(event){
	event.preventDefault();
	var formData = $(this).serialize();
	console.log(formData)
	$.ajax({
		url: '/addMembers',
        type: 'POST',
        data: formData,
        success: (res) => {
			console.log(res)
            if (res.success) {
				$("#membersModel").modal('hide');
				$("#add-member-form")[0].reset();
            } else {
                $("#add-member-error").text(res.msg)
				setTimeout(()=>{
					$("#add-member-error").text("")
				},2000)
            }
        }
	})
})