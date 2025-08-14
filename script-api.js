// JavaScript yang sudah dimodifikasi untuk menggunakan PHP API
class RasyaCitraSavings {
  constructor() {
    this.transactions = []
    this.savingsTarget = 50000000
    this.currentFilter = "all"
    this.apiBase = "./api" // Sesuaikan path API

    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadData()
    this.updateDisplay()
    this.renderTransactions()
    this.setTodayDate()
  }

  async loadData() {
    try {
      // Load transactions
      const transResponse = await fetch(`${this.apiBase}/transactions.php`)
      const transData = await transResponse.json()
      if (transData.success) {
        this.transactions = transData.data
      }

      // Load target
      const targetResponse = await fetch(`${this.apiBase}/settings.php`)
      const targetData = await targetResponse.json()
      if (targetData.success) {
        this.savingsTarget = targetData.target
      }
    } catch (error) {
      console.error("Error loading data:", error)
      this.showNotification("Error loading data from server", "error")
    }
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
    const value = input.value.replace(/[^\d]/g, "")
    input.value = value
  }

  async addTransaction() {
    const type = document.getElementById("type").value
    const amount = Number.parseFloat(document.getElementById("amount").value)
    const description = document.getElementById("description").value
    const date = document.getElementById("date").value

    if (!type || !amount || !description || !date) {
      this.showNotification("Mohon lengkapi semua field!", "error")
      return
    }

    try {
      const response = await fetch(`${this.apiBase}/transactions.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount,
          description,
          date,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await this.loadData()
        this.updateDisplay()
        this.renderTransactions()
        this.clearForm()

        const typeText = type === "income" ? "pemasukan" : "pengeluaran"
        this.showNotification(`✨ Transaksi ${typeText} berhasil ditambahkan!`, "success")
      } else {
        this.showNotification(data.error || "Error adding transaction", "error")
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
      this.showNotification("Error connecting to server", "error")
    }
  }

  async deleteTransaction(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        const response = await fetch(`${this.apiBase}/transactions.php?id=${id}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (data.success) {
          await this.loadData()
          this.updateDisplay()
          this.renderTransactions()
          this.showNotification("🗑️ Transaksi berhasil dihapus!", "success")
        } else {
          this.showNotification(data.error || "Error deleting transaction", "error")
        }
      } catch (error) {
        console.error("Error deleting transaction:", error)
        this.showNotification("Error connecting to server", "error")
      }
    }
  }

  setFilter(filter) {
    this.currentFilter = filter

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

    this.renderTransactions()
  }

  updateDisplay() {
    const totalIncome = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)
    const totalExpense = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)
    const currentBalance = totalIncome - totalExpense
    const progress = Math.min((currentBalance / this.savingsTarget) * 100, 100)

    document.getElementById("totalIncome").textContent = this.formatCurrency(totalIncome)
    document.getElementById("totalExpense").textContent = this.formatCurrency(totalExpense)
    document.getElementById("currentBalance").textContent = this.formatCurrency(currentBalance)
    document.getElementById("savingsTarget").textContent = this.formatCurrency(this.savingsTarget)

    document.getElementById("progressBar").style.width = `${progress}%`
    document.getElementById("progressText").textContent = `${progress.toFixed(1)}%`

    const balanceElement = document.getElementById("currentBalance")
    balanceElement.style.color = currentBalance >= 0 ? "#16a34a" : "#dc2626"

    if (progress >= 100 && currentBalance >= this.savingsTarget) {
      this.celebrateTarget()
    }
  }

  celebrateTarget() {
    const progressText = document.getElementById("progressText")
    progressText.innerHTML = "🎉 Target Tercapai!"
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
            <div class="transaction-date">${this.formatDate(transaction.date)}</div>
          </div>
          <div class="transaction-amount ${transaction.type}">
            ${transaction.type === "income" ? "+" : "-"}${this.formatCurrency(Number.parseFloat(transaction.amount))}
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

async function setTarget() {
  const targetInput = document.getElementById("targetAmount")
  const newTarget = Number.parseFloat(targetInput.value)

  if (!newTarget || newTarget <= 0) {
    rasyaCitraSavings.showNotification("Mohon masukkan target yang valid!", "error")
    return
  }

  try {
    const response = await fetch(`${rasyaCitraSavings.apiBase}/settings.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: newTarget,
      }),
    })

    const data = await response.json()

    if (data.success) {
      rasyaCitraSavings.savingsTarget = data.target
      rasyaCitraSavings.updateDisplay()
      targetInput.value = ""
      rasyaCitraSavings.showNotification("🎯 Target tabungan berhasil diperbarui!", "success")
    } else {
      rasyaCitraSavings.showNotification(data.error || "Error updating target", "error")
    }
  } catch (error) {
    console.error("Error updating target:", error)
    rasyaCitraSavings.showNotification("Error connecting to server", "error")
  }
}

const rasyaCitraSavings = new RasyaCitraSavings()
