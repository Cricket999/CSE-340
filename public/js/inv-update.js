const form = document.getElementById("updateForm")
    form.addEventListener("change", function () {
      const updateBtn = document.getElementById("submit")
      updateBtn.removeAttribute("disabled")
    })