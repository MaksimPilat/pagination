const DATA = [];

for (let i = 1; i <= 100; i++) {
  DATA.push(`item${i}`);
}

class Pagination {
  constructor(root, pageLimit, scopeLimit) {
    this.root = root;
    this.pageLimit = pageLimit;
    this.scopeLimit = scopeLimit;
    this.pages = [];
    this.currentPage = 0;

    this.initUI();
    this.switchPage(0).then(() => {
      this.updateUI();
    });
  }

  initUI() {
    const controlBtns = this.root.querySelectorAll('.control-btn');

    controlBtns[0].addEventListener('click', () => {
      let pageIndex;
      if (this.pages[0].index === 0) {
        let remainder = this.getNumberOfPages() % this.scopeLimit;
        if (remainder === 0) {
          remainder = 1;
        }
        pageIndex = this.getNumberOfPages() - remainder;
      } else {
        pageIndex = this.pages[0].index - this.scopeLimit;
      }
      this.switchPage(pageIndex).then(() => this.updateUI());
    });

    controlBtns[1].addEventListener('click', () => {
      let pageIndex;
      if (
        this.pages[this.pages.length - 1].index >=
        this.getNumberOfPages() - 1
      ) {
        pageIndex = 0;
      } else {
        pageIndex = this.pages[0].index + this.scopeLimit;
      }
      this.switchPage(pageIndex).then(() => this.updateUI());
    });

    console.log('initUI');
  }

  updateUI() {
    const prevBtns = Array.from(this.root.querySelectorAll('.pagination-btn'));
    prevBtns.push(this.root.querySelector('.pagination-btn.active'));
    prevBtns.forEach((btn) => {
      btn?.remove();
    });

    this.pages.forEach((page) => {
      const btn = document.createElement('button');
      btn.classList.add('pagination-btn');
      btn.id = `pagination-btn-${page.index}`;
      btn.innerText = page.index;
      btn.addEventListener('click', (event) =>
        this.paginationBtnHandler(event)
      );

      const rightBtn = this.root.querySelectorAll('.control-btn')[1];
      this.root.querySelector('#controls').insertBefore(btn, rightBtn);
    });

    const activeBtn = this.root.querySelectorAll('.pagination-btn')[0];
    activeBtn?.classList.add('active');

    console.log('updateUI');
  }

  paginationBtnHandler(event) {
    const activeBtn = this.root.querySelector('.pagination-btn.active');
    activeBtn.classList.remove('active');
    const currentBtn = event.target;
    currentBtn.classList.add('active');
    const pageIndex = +currentBtn.id.split('-').pop();

    this.switchPage(pageIndex);
  }

  async fetchPages(pageIndex) {
    this.pages = [];

    this.root.querySelector('#content').classList.add('hide');
    loader.classList.remove('hide');

    await new Promise((resolve) => setTimeout(resolve, 300));

    this.root.querySelector('#content').classList.remove('hide');
    loader.classList.add('hide');

    let startPageIndex =
      Math.floor(pageIndex / this.scopeLimit) * this.scopeLimit;

    const startIndex = startPageIndex * this.pageLimit;
    if (DATA.length - 1 < startIndex) throw 'There is no such page.';

    let endIndex =
      startPageIndex * this.pageLimit + this.scopeLimit * this.pageLimit;
    if (DATA.length - 1 < endIndex) endIndex = undefined;

    const data = DATA.slice(startIndex, endIndex);

    let index = startPageIndex;
    for (let i = 0; i < data.length; i += this.pageLimit) {
      this.pages.push({
        index: index,
        items: data.slice(i, i + this.pageLimit),
      });
      index++;
    }

    console.log('fetchPages:', this.pages);
  }

  getNumberOfPages() {
    return DATA.length / this.pageLimit;
  }

  async switchPage(pageIndex) {
    this.currentPage = pageIndex;

    if (
      this.pages.findIndex((elem) => elem.index === this.currentPage) === -1
    ) {
      try {
        await this.fetchPages(this.currentPage);
      } catch (error) {
        console.error(error);
      }
    }

    console.log('switchPage');

    this.renderContent();
  }

  renderContent() {
    const page = this.pages.find((page) => page.index === this.currentPage);

    if (page) {
      this.root.querySelector('#content').innerHTML = page.items.join(' ');
    } else return 'Nothing found.';

    console.log('renderContent');
  }
}

const loader = document.getElementById('loader');

const root = document.getElementById('pagination');

const pagination = new Pagination(root, 3, 5);
