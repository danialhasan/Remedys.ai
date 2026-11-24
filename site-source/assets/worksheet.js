(() => {
  const sheet = document.getElementById('worksheet');
  if (!sheet) return;

  const answers = Array.from(sheet.querySelectorAll('[contenteditable]'));
  const examples = answers.map(answer => answer.textContent);
  const print = sheet.querySelector('[data-worksheet-print]');
  const example = sheet.querySelector('[data-worksheet-example]');

  function updateExampleButton() {
    const blank = answers.every(answer => !answer.textContent.trim());
    const unchanged = answers.every((answer, index) => answer.textContent === examples[index]);
    example.hidden = !blank && !unchanged;
    example.textContent = blank ? 'Show project intake example' : 'Start with a blank sheet';
    return blank;
  }

  example.addEventListener('click', () => {
    const showExample = updateExampleButton();
    answers.forEach((answer, index) => {
      answer.textContent = showExample ? examples[index] : '';
    });
    updateExampleButton();
    answers[0].focus();
  });
  sheet.addEventListener('input', updateExampleButton);
  print.addEventListener('click', () => {
    document.body.dataset.printWorksheet = '';
    window.print();
  });
  window.addEventListener('afterprint', () => delete document.body.dataset.printWorksheet);
  print.hidden = false;
  updateExampleButton();
})();
