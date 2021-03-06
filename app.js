const StorageCtrl = (function () {

})();



const DataCtrl = (function () {
  const Item = function (id, expense, count, description, category) {
    this.id = id;
    this.expense = expense;
    this.count = count;
    this.description = description;
    this.category = category;
  };

  const data = {
    items: [],
    balance: 0,
    currentItem: null
  };

  return {
    addExpense: function (price, count, description, category) {

      if (price !== '' && count !== '' && description !== '' && category !== '') {
        let id = 0;

        if (data.items.length === 0) {
          id = 1;
        } else {
          id = data.items.length + 1;
        }
        const item = new Item(id, price, count, description, category);

        data.items.push(item);

        DataCtrl.calculateBalance(parseFloat(item.expense).toFixed(2), parseInt(item.count));
        UICtrl.clearFormInputs();
        UICtrl.renderItemRow(item);
        UICtrl.renderBalance();
        UICtrl.renderAddExpenseNotification('add', 'New item was successfuly created');
        console.log(DataCtrl.getItems());

        return item;
      }
      
    },
    removeExpenseById: function(id) {
      const ids = data.items.map(function(item) {
        return parseInt(item.id);
      });

      let currentIndex;
      let deletedItemId;

      ids.forEach(function(currentId, index) {
        if (currentId === id) {
          currentIndex = index;
        }
      });

      deletedItemId = data.items[currentIndex].id;
      data.items.splice(currentIndex, 1);

      return deletedItemId;

    },
    calculateBalance: function(amount, count) {
      data.balance += parseFloat(amount) * count;
    },
    getData: function () {
      return data;
    },
    getItems: function () {
      return data.items;
    }
  };

})();



const UICtrl = (function () {
  const UIselectors = {
    container: '.container',
    incomesPriceInput: '#price-input-incomes',
    expensesCard: '.expenses-card',
    expensePriceInput: '#expenses-price-input',
    expensesCountInput: '#expenses-count-input',
    expensesDescriptionInput: '#expenses-description-input',
    expensesCategorySelect: '#expenses-category-select',
    expensesAddBtn: '#expenses-add-btn',
    formInputs: '.form-control',
    balanceContainer: '.balance-container',
    balanceText: '#balance-text' ,
    tableBody: '#table-body',
    table: '.table-responsive'
  };

  return {
    getUISelectors: function () {
      return UIselectors;
    },
    validateInputs: function(ev) {
      if (ev.target.value === '') {
        ev.target.classList.add('is-invalid');
      } else {
        ev.target.classList.remove('is-invalid');
      }
    },
    clearValidationWarning: function(ev) {
      if (ev.target.classList.contains('is-invalid')) {
        ev.target.classList.remove('is-invalid');
      }
    },
    clearFormInputs: function() {
      document.querySelector(UIselectors.expensePriceInput).value = '';
      document.querySelector(UIselectors.expensesCountInput).value = '';
      document.querySelector(UIselectors.expensesDescriptionInput).value = '';
      document.querySelector(UIselectors.expensesCategorySelect).value = '';
    },
    hideTable: function() {
      
      if (DataCtrl.getItems().length === 0) {
        document.querySelector(UIselectors.table).classList.remove('visible');
        document.querySelector(UIselectors.table).classList.add('unvisible');
      } else {
        document.querySelector(UIselectors.table).classList.remove('unvisible');
        document.querySelector(UIselectors.table).classList.add('visible');
      }
    },
    renderAddExpenseNotification: function(mode, notificationText) {
      let classByMode = '';
      const timeOut = 3000;

      if (mode === 'add') {
        classByMode = 'alert alert-success mt-4';
      } else {
        classByMode = 'alert alert-danger mt-4';
      }

      const container = document.querySelector(UIselectors.container);
      const balanceContainer = document.querySelector(UIselectors.balanceContainer);

      const notificationContainer = document.createElement('div');
      const textContent = document.createTextNode(notificationText);
      notificationContainer.className = classByMode;
      notificationContainer.appendChild(textContent);

      container.insertBefore(notificationContainer, balanceContainer);

      setTimeout(function() {
        notificationContainer.remove();
      }, timeOut);
    },
    renderItemRow: function(inputData) {
      const html = `
        <tr class="collection-row" id="row-${inputData.id}">
          <td>${inputData.category}</td>
          <td>${inputData.description}</td>
          <td>$${inputData.expense}</td>
          <td>${inputData.count}</td>
          <td class="d-flex justify-content-center">
            <a href="#" id="update-link" class="secondary-content mr-3 mr-md-4 mr-lg-5">
              <i data-toggle="tooltip" data-id="${inputData.id}" data-placement="top" title="udpate this item" class="edit-icon fa fa-pencil" style="color:#28a745"></i>
            </a>
            <a href="#" id="remove-link" class="secondary-content">
              <i data-toggle="tooltip" data-placement="top" data-id="${inputData.id}" title="remove this item" class="remove-icon fa fa-trash-o" style="color:#dc3545"></i>
            </a>
          </td>
        </tr>
      `;

      document.querySelector(UIselectors.tableBody).insertAdjacentHTML('afterbegin', html);
    },
    renderBalance: function() {
      const balanceValue = DataCtrl.getData().balance;
      document.querySelector(UIselectors.balanceText).innerHTML = `$${balanceValue}`;
    },
    removeExpenseFromUI: function(id) {
      const rowBeingRemoved = document.querySelector(`#row-${id}`);
      if (rowBeingRemoved.previousElementSibling === null && rowBeingRemoved.nextElementSibling === null) {
        rowBeingRemoved.remove();
        UICtrl.hideTable();
      } else {
        rowBeingRemoved.remove();
      }
    },
    getValueObjFromInputs: function () {
      return {
        expensePriceInputVal: document.querySelector(UIselectors.expensePriceInput).value,
        expensesCountInputVal: document.querySelector(UIselectors.expensesCountInput).value,
        expensesDescriptionInputVal: document.querySelector(UIselectors.expensesDescriptionInput).value,
        expensesCategorySelectVal: document.querySelector(UIselectors.expensesCategorySelect).value
      }
    }
  };
})();



const App = (function (StorageCtrl, DataCtrl, UICtrl, $) {
  const onEventListenersLoad = function () {
    document.addEventListener('DOMContentLoaded', onDOMCOntentLoaded, false);
    document.querySelector(UICtrl.getUISelectors().expensesAddBtn).addEventListener('click', onAddExpensesBtnClick, false);
    document.querySelectorAll(UICtrl.getUISelectors().formInputs).forEach(function(input) {
      input.addEventListener('blur', onInputBlur, false);
      input.addEventListener('keypress', onInputChange, false);
    });
    document.querySelector(UICtrl.getUISelectors().expensesCategorySelect).addEventListener('change', onInputChange, false);
    document.querySelector(UICtrl.getUISelectors().tableBody).addEventListener('click', onRemoveExpenseIconCLick, false);
  };

  const onDOMCOntentLoaded = function () {
    UICtrl.hideTable();
    UICtrl.renderBalance();

    $('[data-toggle="tooltip"]').tooltip();
  };

  const onInputBlur = function(ev) {
    UICtrl.validateInputs(ev);
  };

  const onInputChange = function(ev) {
    UICtrl.clearValidationWarning(ev);
  }

  const onAddExpensesBtnClick = function (ev) {
    document.querySelector(UICtrl.getUISelectors().table).classList.add('visible');

    const inputValues = UICtrl.getValueObjFromInputs();

    const item = DataCtrl.addExpense(inputValues.expensePriceInputVal, inputValues.expensesCountInputVal, inputValues.expensesDescriptionInputVal, inputValues.expensesCategorySelectVal);

    ev.preventDefault();
  };

  const onRemoveExpenseIconCLick = function(ev) {
    if (ev.target.classList.contains('remove-icon')) {
      const id = ev.target.dataset.id;
      const deletedItemId = DataCtrl.removeExpenseById(parseInt(id));
      UICtrl.removeExpenseFromUI(deletedItemId);
    }

    ev.preventDefault();
  }

  return {
    init: function () {
      onEventListenersLoad();
    }
  };

})(StorageCtrl, DataCtrl, UICtrl, jQuery);


App.init();