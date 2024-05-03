import { GithubUser } from "./GithubUser.js"

// class that will contain the data logic
// how the data will be structured
export class Favorites {
  constructor(root){
    this.root = document.querySelector(root)
    this.load()
  }

  load(){
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username){
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já adicionado!')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      
    } catch(error) {
      alert(error.message)
    }
    this.root.querySelector('header input').value = ""
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// class that will create the HTML view and events
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()


    if(this.entries.length === 0){
      const row = this.noUser()

      this.tbody.append(row)

    } else {
      this.entries.forEach(user=> {
        const row = this.createRow()
  
        row.querySelector('.user img').src=`https://github.com/${user.login}.png`
        row.querySelector('.user img').alt = `Imagem de ${user.name}`
        row.querySelector('.user a').href = `https://github.com/${user.login}`
        row.querySelector('.user p').textContent = user.name
        row.querySelector('.user span').textContent = user.login
        row.querySelector('.repositories').textContent = user.public_repos
        row.querySelector('.followers').textContent = user.followers
  
        row.querySelector('.remove').onclick = () => {
          const isOk = confirm('Tem certeza que deseja deletar essa linha?')
          if(isOk) {
            this.delete(user)
          }
        }
  
        this.tbody.append(row)
      })
    }

  }

  noUser() {
    const tr = document.createElement('tr')
    tr.classList.add('tr-no-user')

    tr.innerHTML = `
    <td colspan="4">
      <div class="no-user">
        <img src="/images/startbg.svg" alt="ícone de uma estrela surpresa">
        <span>Nenhum favorito ainda</span>
      </div>
    </td>
    `

    return tr
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/carloseduuuuu.png" alt="Imagem de Carlos Eduardo">
        <a href="https://github.com/carloseduuuuu" target="_blank">
          <p>Carlos Eduardo</p>
          <span>carloseduuuuu</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9589
      </td>
      <td>
        <button class="remove">Remove</button>
      </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}