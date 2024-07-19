$(document).ready(function() {
  let authToken = null;

  const showModal = (modalId) => {
    $(`#${modalId}`).css('display', 'block');
  };

  const closeModal = () => {
    $('.modal').css('display', 'none');
  };

  $('.close').on('click', closeModal);
  $(window).on('click', function(event) {
    if ($(event.target).hasClass('modal')) {
      closeModal();
    }
  });

  const showNotes = async () => {
    if (!authToken) return;

    try {
      const response = await fetch('https://new-note-app-qknv.onrender.com/notes', {
        headers: { 'Authorization': authToken }
      });
      const notes = await response.json();
      $('#notesList').html('');
      notes.forEach(note => {
        $('#notesList').append(`
          <div class="note" style="background-color: ${note.backgroundColor}">
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p><strong>Tags:</strong> ${note.tags.join(', ')}</p>
            <button class="archiveBtn" data-id="${note._id}">Archive</button>
            <button class="deleteBtn" data-id="${note._id}">Delete</button>
          </div>
        `);
      });

      $('.archiveBtn').on('click', archiveNote);
      $('.deleteBtn').on('click', deleteNote);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  };

  const archiveNote = async (event) => {
    const noteId = $(event.target).data('id');
    try {
      await fetch(`https://new-note-app-qknv.onrender.com/notes/${noteId}/archive`, {
        method: 'POST',
        headers: { 'Authorization': authToken }
      });
      showNotes();
    } catch (error) {
      console.error('Failed to archive note', error);
    }
  };

  const deleteNote = async (event) => {
    const noteId = $(event.target).data('id');
    try {
      await fetch(`https://new-note-app-qknv.onrender.com/notes/${noteId}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': authToken }
      });
      showNotes();
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  $('#registerBtn').on('click', () => showModal('registerModal'));
  $('#loginBtn').on('click', () => showModal('loginModal'));
  $('#logoutBtn').on('click', () => {
    authToken = null;
    $('#registerBtn').show();
    $('#loginBtn').show();
    $('#logoutBtn').hide();
    $('#notesList').html('');
  });

  $('#registerSubmit').on('click', async () => {
    const username = $('#registerUsername').val();
    const password = $('#registerPassword').val();
    try {
      const response = await fetch('https://new-note-app-qknv.onrender.com/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (response.status === 201) {
        alert('Registration successful');
        closeModal();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Registration failed', error);
    }
  });

  $('#loginSubmit').on('click', async () => {
    const username = $('#loginUsername').val();
    const password = $('#loginPassword').val();
    try {
      const response = await fetch('https://new-note-app-qknv.onrender.com/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (response.status === 200) {
        authToken = `Bearer ${result.token}`;
        $('#registerBtn').hide();
        $('#loginBtn').hide();
        $('#logoutBtn').show();
        showNotes();
        closeModal();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  });

  $('#saveNoteBtn').on('click', async () => {
    const title = $('#noteTitle').val();
    const content = $('#noteContent').val();
    const tags = $('#noteTags').val().split(',').map(tag => tag.trim());
    const backgroundColor = $('#noteColor').val();
    try {
      const response = await fetch('https://new-note-app-qknv.onrender.com/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({ title, content, tags, backgroundColor })
      });
      const result = await response.json();
      if (response.status === 201) {
        showNotes();
        $('#noteTitle').val('');
        $('#noteContent').val('');
        $('#noteTags').val('');
        $('#noteColor').val('#ffffff');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to save note', error);
    }
  });
});
