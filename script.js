class RasyaCitraSavings {
  constructor() {
    this.currentUser = localStorage.getItem("rasyaCitraCurrentUser") || null
    this.transactions = JSON.parse(localStorage.getItem("rasyaCitraTransactions")) || []
    this.savingsTarget = Number.parseFloat(localStorage.getItem("rasyaCitraTarget")) || 50000000
    this.currentFilter = "all"

    this.init()
  }

  init() {
    this.checkAuthStatus()
    this.setupEventListeners()
    this.updateDisplay()
    this.renderTransactions()
    this.setTodayDate()
  }

  checkAuthStatus() {
    const loginScreen = document.getElementById("loginScreen")
    const mainApp = document.getElementById("mainApp")

    if (this.currentUser) {
      // User is logged in, show main app
      loginScreen.classList.add("hidden")
      mainApp.classList.remove("hidden")
      this.updateUserDisplay()
    } else {
      // User not logged in, show login screen
      loginScreen.classList.remove("hidden")
      mainApp.classList.add("hidden")
    }
  }

  login(userName) {
    this.currentUser = userName
    localStorage.setItem("rasyaCitraCurrentUser", userName)

    // Show welcome animation
    this.showWelcomeAnimation(userName)

    // Hide login screen and show main app after animation
    setTimeout(() => {
      document.getElementById("loginScreen").classList.add("hidden")
      document.getElementById("mainApp").classList.remove("hidden")
      this.updateUserDisplay()
    }, 4000) // Animation duration
  }

  logout() {
    if (confirm("Yakin ingin keluar dari aplikasi?")) {
      this.currentUser = null
      localStorage.removeItem("rasyaCitraCurrentUser")

      // Show login screen and hide main app
      document.getElementById("loginScreen").classList.remove("hidden")
      document.getElementById("mainApp").classList.add("hidden")

      this.showNotification("👋 Berhasil keluar dari aplikasi!", "success")
    }
  }

  updateUserDisplay() {
    const currentUserElement = document.getElementById("currentUser")
    if (this.currentUser) {
      currentUserElement.textContent = this.currentUser
      this.updatePersonalizedContent()
    }
  }

  updatePersonalizedContent() {
    const user = this.currentUser

    const headerSubtitle = document.getElementById("headerSubtitle")
    const personalizedSubtitles = {
      Rasya: "Semangat menabung untuk masa depan yang cerah! 💪",
      Citra: "Yuk wujudkan impian kita bersama-sama! ✨",
    }
    headerSubtitle.textContent =
      personalizedSubtitles[user] || "Mari wujudkan impian bersama, satu langkah pada satu waktu ✨"

    const formTitle = document.getElementById("formTitle")
    formTitle.innerHTML = `<i class="fas fa-plus-circle"></i> Tambah Transaksi ${user}`

    const descriptionInput = document.getElementById("description")
    const personalizedPlaceholders = {
      Rasya: "Contoh: Gaji Rasya, Beli kopi, Transfer ke Citra",
      Citra: "Contoh: Gaji Citra, Belanja bulanan, Tabungan bersama",
    }
    descriptionInput.placeholder = personalizedPlaceholders[user] || "Contoh: Gaji bulanan, Beli makan"

    const tipsTitle = document.getElementById("tipsTitle")
    const tipsList = document.getElementById("tipsList")

    const personalizedTips = {
      Rasya: {
        title: "💡 Tips Khusus untuk Rasya:",
        tips: [
          "Sisihkan 25% dari gaji untuk tabungan bersama",
          "Catat pengeluaran harian di aplikasi ini",
          "Diskusikan rencana keuangan dengan Citra",
          "Rayakan setiap pencapaian target kecil",
        ],
      },
      Citra: {
        title: "💡 Tips Khusus untuk Citra:",
        tips: [
          "Buat budget belanja bulanan yang realistis",
          "Sisihkan uang receh untuk tabungan darurat",
          "Komunikasi terbuka dengan Rasya tentang keuangan",
          "Investasi kecil untuk masa depan bersama",
        ],
      },
    }

    if (personalizedTips[user]) {
      tipsTitle.textContent = personalizedTips[user].title
      tipsList.innerHTML = personalizedTips[user].tips.map((tip) => `<li>${tip}</li>`).join("")
    }

    const targetTitle = document.getElementById("targetTitle")
    const targetDescription = document.getElementById("targetDescription")

    const personalizedTargets = {
      Rasya: {
        title: "🎯 Target Tabungan Rasya",
        description: "Tentukan target yang ingin kamu capai untuk masa depan bersama Citra",
      },
      Citra: {
        title: "🎯 Target Tabungan Citra",
        description: "Atur target tabungan yang ingin kita wujudkan bersama Rasya",
      },
    }

    if (personalizedTargets[user]) {
      targetTitle.innerHTML = `<i class="fas fa-target"></i> ${personalizedTargets[user].title}`
      targetDescription.textContent = personalizedTargets[user].description
    }
  }

  showWelcomeAnimation(userName) {
    const welcomeAnimation = document.getElementById("welcomeAnimation")
    const welcomeText = document.getElementById("welcomeText")

    welcomeText.textContent = `Selamat Datang, ${userName}!`
    welcomeAnimation.classList.remove("hidden")

    // Hide animation after 4 seconds
    setTimeout(() => {
      welcomeAnimation.classList.add("hidden")
    }, 4000)
  }

  setupEventListeners() {
    // Form submission
    document.getElementById("transactionForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTransaction()
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter)
      })
    })

    // Amount input formatting
    document.getElementById("amount").addEventListener("input", (e) => {
      this.formatAmountInput(e.target)
    })

    document.getElementById("targetAmount").addEventListener("input", (e) => {
      this.formatAmountInput(e.target)
    })
  }

  setTodayDate() {
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("date").value = today
  }

  formatAmountInput(input) {
    // Remove non-numeric characters except decimal point
    const value = input.value.replace(/[^\d]/g, "")
    input.value = value
  }

  addTransaction() {
    const type = document.getElementById("type").value
    const amount = Number.parseFloat(document.getElementById("amount").value)
    const description = document.getElementById("description").value
    const date = document.getElementById("date").value

    if (!type || !amount || !description || !date) {
      this.showNotification("Mohon lengkapi semua field!", "error")
      return
    }

    const transaction = {
      id: Date.now(),
      type,
      amount,
      description,
      date,
      timestamp: new Date().toISOString(),
      user: this.currentUser,
    }

    this.transactions.unshift(transaction)
    this.saveToLocalStorage()
    this.updateDisplay()
    this.renderTransactions()
    this.clearForm()

    const typeText = type === "income" ? "pemasukan" : "pengeluaran"
    const personalizedMessages = {
      Rasya: `✨ Keren ${this.currentUser}! Transaksi ${typeText} berhasil ditambahkan!`,
      Citra: `🎉 Hebat ${this.currentUser}! Transaksi ${typeText} sudah tercatat!`,
    }
    const message = personalizedMessages[this.currentUser] || `✨ Transaksi ${typeText} berhasil ditambahkan!`
    this.showNotification(message, "success")
  }

  deleteTransaction(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      this.transactions = this.transactions.filter((t) => t.id !== id)
      this.saveToLocalStorage()
      this.updateDisplay()
      this.renderTransactions()
      this.showNotification("🗑️ Transaksi berhasil dihapus!", "success")
    }
  }

  setFilter(filter) {
    this.currentFilter = filter

    // Update active button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

    this.renderTransactions()
  }

  updateDisplay() {
    const totalIncome = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = this.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const currentBalance = totalIncome - totalExpense
    const progress = Math.min((currentBalance / this.savingsTarget) * 100, 100)

    // Update display
    document.getElementById("totalIncome").textContent = this.formatCurrency(totalIncome)
    document.getElementById("totalExpense").textContent = this.formatCurrency(totalExpense)
    document.getElementById("currentBalance").textContent = this.formatCurrency(currentBalance)
    document.getElementById("savingsTarget").textContent = this.formatCurrency(this.savingsTarget)

    // Update progress bar
    document.getElementById("progressBar").style.width = `${progress}%`
    document.getElementById("progressText").textContent = `${progress.toFixed(1)}%`

    // Change balance color based on positive/negative
    const balanceElement = document.getElementById("currentBalance")
    balanceElement.style.color = currentBalance >= 0 ? "#16a34a" : "#dc2626"

    if (progress >= 100 && currentBalance >= this.savingsTarget) {
      this.celebrateTarget()
    }
  }

  celebrateTarget() {
    const progressText = document.getElementById("progressText")
    const celebrationMessages = {
      Rasya: "🎉 Mantap Rasya!",
      Citra: "🎉 Keren Citra!",
    }
    const message = celebrationMessages[this.currentUser] || "🎉 Target Tercapai!"
    progressText.innerHTML = message
    progressText.style.color = "#16a34a"
    progressText.style.fontWeight = "700"
  }

  renderTransactions() {
    const container = document.getElementById("transactionsList")
    let filteredTransactions = this.transactions

    if (this.currentFilter !== "all") {
      filteredTransactions = this.transactions.filter((t) => t.type === this.currentFilter)
    }

    if (filteredTransactions.length === 0) {
      const filterText =
        this.currentFilter === "all" ? "" : this.currentFilter === "income" ? " pemasukan" : " pengeluaran"
      container.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>Belum ada transaksi${filterText}</p>
                    <small>Mulai tambahkan transaksi pertama!</small>
                </div>
            `
      return
    }

    container.innerHTML = filteredTransactions
      .map(
        (transaction) => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}${transaction.user ? ` • ${transaction.user}` : ""}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}${this.formatCurrency(transaction.amount)}
                </div>
                <button class="transaction-delete" onclick="rasyaCitraSavings.deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
      )
      .join("")
  }

  clearForm() {
    document.getElementById("transactionForm").reset()
    this.setTodayDate()
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString("id-ID", options)
  }

  saveToLocalStorage() {
    localStorage.setItem("rasyaCitraTransactions", JSON.stringify(this.transactions))
    localStorage.setItem("rasyaCitraTarget", this.savingsTarget.toString())
  }

  showNotification(message, type = "success") {
    const container = document.getElementById("notification-container")
    const notification = document.createElement("div")

    const bgColor =
      type === "success"
        ? "linear-gradient(135deg, #16a34a, #22c55e)"
        : type === "error"
          ? "linear-gradient(135deg, #dc2626, #ef4444)"
          : "linear-gradient(135deg, #3b82f6, #60a5fa)"

    notification.className = "notification"
    notification.style.background = bgColor
    notification.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
      <span>${message}</span>
    `

    container.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

function login(userName) {
  rasyaCitraSavings.login(userName)
}

function logout() {
  rasyaCitraSavings.logout()
}

function setTarget() {
  const targetInput = document.getElementById("targetAmount")
  const newTarget = Number.parseFloat(targetInput.value)

  if (!newTarget || newTarget <= 0) {
    rasyaCitraSavings.showNotification("Mohon masukkan target yang valid!", "error")
    return
  }

  rasyaCitraSavings.savingsTarget = newTarget
  rasyaCitraSavings.saveToLocalStorage()
  rasyaCitraSavings.updateDisplay()
  targetInput.value = ""

  rasyaCitraSavings.showNotification("🎯 Target tabungan berhasil diperbarui!", "success")
}

const rasyaCitraSavings = new RasyaCitraSavings()
