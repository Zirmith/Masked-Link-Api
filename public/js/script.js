// When the page loads, load the user's links



$(document).ready(function() {
    $('.loader').fadeIn('slow');
    loadLinks();
  });
  
  // Handle form submission
  $('#link-form').submit(function(event) {
    event.preventDefault();
    const url = $('#url-input').val();
    axios.post('/links', { url })
      .then(function(response) {
        console.log(response.data);
        loadLinks();
        $('#url-input').val('');
      })
      .catch(function(error) {
        console.log(error);
      });
  });
  
  // Load the user's links
function loadLinks() {
    axios.get('/links')
      .then(function(response) {
        console.log(response.data);
        const linkTableBody = $('#link-table-body');
        linkTableBody.empty();
        const linkCount = Object.keys(response.data).length;
        if (linkCount === 0) {
          const row = $('<tr>');
          row.append($('<td>').text('No links found'));
          linkTableBody.append(row);
        } else {
          let loadedLinks = 0;
          Object.values(response.data).forEach(function(link) {
            const row = $('<tr>');
            row.append($('<td>').html(`<a href="/server/data/${link.code}">https://masked-api.onrender.com/server/data/${link.code}</a>`));
            row.append($('<td>').text(link.originalUrl));
            linkTableBody.append(row);
            loadedLinks++;
            const progress = (loadedLinks / linkCount) * 100;
            $('.loader-progress').css('width', progress + '%');
            $('.loader-text').text(`Masked - ${loadedLinks} of ${linkCount} links loaded`);
            if (loadedLinks === linkCount) {
                setTimeout(() => {
                    $('.loader').fadeOut('slow');
                }, 2000);
              
            }
          });
        }
      })
      .catch(function(error) {
        console.log(error);
        $('.loader').fadeOut('slow');
      });
  }
  
  
  
