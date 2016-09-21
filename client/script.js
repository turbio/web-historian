var newLink = (url, status) => {
  var statuses = [
    '<span class="status-icon"><i class="material-icons">access_time</i></span>',
    '<span class="status-icon"><i class="sync-icon material-icons">sync</i></span>',
    '<span class="status-icon"><i class="material-icons">done</i></span>'
  ];

  var card = `
  <div class="col s12 l3 m6">
    <div class="card blue-grey darken-1">
      <div class="card-content white-text">
        <span class="card-title">${url}</span>
        ${statuses[status]}
      </div>
      <div class="card-action">
        <a href="/${url}">visit</a>
      </div>
    </div>
  </div>`;

  $('#link-list').append($(card));
};

$(_ =>
  $.get('/links', data =>
    data.forEach(link =>
      newLink(link.url, link.status))));
