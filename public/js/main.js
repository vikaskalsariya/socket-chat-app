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
					<div class="current-user-chat ml-2" id=${res.data._id}>
						<h5>${chat}
							<i class="fa fa-trash mx-1" aria-hidden="true" data-id="${res.data._id}" data-bs-toggle="modal" data-bs-target="#deleteModel"></i>
						</h5>
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
		<div class="distance-user-chat mx-1 mr-2" id=${data._id}>
			<h5>
				${data.message}
			</h5>
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
			<div class="current-user-chat" id=${chat._id}>
				<h5>${chat.message}
					<i class="fa fa-trash mx-1" aria-hidden="true" data-id="${chat._id}" data-bs-toggle="modal" data-bs-target="#deleteModel"></i>
				</h5>
			</div>
			`
		} else {
			// addClass = 'distance-user-chat'
			html += `
			<div class="distance-user-chat mx-1" id=${chat._id}>
				<h5>
					${chat.message}
				</h5>
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