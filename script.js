// Xóa toàn bộ ảnh trong khung "Nhật Ký Mầm Xanh" bị kẹt
try {
    localStorage.removeItem('green_moments');
} catch (e) {}


// Hiệu ứng cây lớn theo cuộn
let lastScrollY = 0;
const tree = document.getElementById('growing-tree');
const treePath = document.querySelector('.tree-path');

// Hiệu ứng chuột (Mầm Xanh)
let lastLeafTime = 0;

function updateTreeGrowth(scrollY) {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(scrollY / scrollHeight, 1);
    
    // Cập nhật kích thước cây
    const treeSize = 12 + (scrollPercent * 36); // từ 12px đến 48px
    tree.style.width = `${treeSize}px`;
    tree.style.height = `${treeSize}px`;
    
    // Cập nhật độ dày đường cây
    const strokeWidth = 2 + (scrollPercent * 3);
    treePath.style.strokeWidth = `${strokeWidth}px`;
    
    // Đổi màu khi gần cuối trang
    if (scrollPercent > 0.8) {
        treePath.style.stroke = '#fbbf24'; // Màu vàng khi nở hoa
    }
}

// Hiệu ứng mầm xanh khi di chuyển chuột
function emitLeaf(e) {
    const now = Date.now();
    if (now - lastLeafTime < 50) return; // limit rate
    lastLeafTime = now;
    
    // chance to emit
    if (Math.random() > 0.6) return;

    const leaf = document.createElement('div');
    leaf.className = 'cursor-leaf';
    const emojies = ['🌱', '🌿', '🍃', '🍀'];
    leaf.textContent = emojies[Math.floor(Math.random() * emojies.length)];
    
    leaf.style.left = e.clientX + 'px';
    leaf.style.top = e.clientY + 'px';
    
    const tx = (Math.random() - 0.5) * 60 + 'px';
    const ty = (Math.random() - 0.2) * 60 + 'px';
    const rot = (Math.random() - 0.5) * 180 + 'deg';
    
    leaf.style.setProperty('--tx', tx);
    leaf.style.setProperty('--ty', ty);
    leaf.style.setProperty('--rot', rot);
    
    document.body.appendChild(leaf);
    
    setTimeout(() => {
        if(leaf.parentNode) leaf.parentNode.removeChild(leaf);
    }, 800);
}


// Bộ đếm thời gian thực
function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    // Sử dụng IntersectionObserver để chỉ đếm khi màn hình cuộn xuống tới nơi
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target') || '0', 10);
                let current = 0;
                const duration = 2000;
                const start = performance.now();
                
                const step = now => {
                    const progress = Math.min((now - start) / duration, 1);
                    current = Math.floor(progress * target);
                    counter.textContent = current.toLocaleString('vi-VN');
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                };
                requestAnimationFrame(step);
                
                // Unobserve để chỉ chạy animation 1 lần
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.1 }); // Bắt đầu đếm khi hiển thị 10%

    counters.forEach(counter => observer.observe(counter));
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
 
  const leafVein = document.getElementById('leaf-vein');
  
  const onScroll = () => {
    if (window.scrollY > 10) {
      nav.classList.add('shadow-sm');
    } else {
      nav.classList.remove('shadow-sm');
    }
    
  
    updateTreeGrowth(window.scrollY);
    
  
    if (leafVein) {
      const section = leafVein.closest('section');
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Section đang hiển thị
        const scrollPercent = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
        leafVein.style.transform = `translateX(-50%) scaleY(${scrollPercent * 1.5})`;
      }
    }
  };
  
  window.addEventListener('scroll', onScroll);
  onScroll();

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sprouted');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('[data-sprout]').forEach(el => observer.observe(el));

  // Bộ đếm sách
  const bookCounter = document.querySelector('[data-count]');
  if (bookCounter) {
    const target = parseInt(bookCounter.getAttribute('data-count') || '0', 10);
    let current = 0;
    const duration = 1200;
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      current = Math.floor(progress * target);
      bookCounter.textContent = current.toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Bộ đếm thời gian thực
  animateCounters();

  const form = document.getElementById('volunteer-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault(); // Ngăn trang bị tải lại
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Đang gửi... 🚀';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const actionUrl = form.getAttribute('action');
      
      // Gửi tự động qua Email (Sử dụng AJAX fetch để không bị chuyển tab)
      fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json' // FormSubmit sẽ biết và trả về tín hiệu ngầm thay vì tải trang mới
          }
      })
      .then(response => {
          if (response.ok) {
              showCustomAlert('Thành công rực rỡ!', 'Thông tin đăng ký của bạn đã bay thẳng đến hộp thư của Admin rồi nhé 🕊️', 'success');
              form.reset();
          } else {
              showCustomAlert('Ôi hỏng!', 'Có lỗi nhỏ xảy ra từ máy chủ. Vui lòng thử lại nha!', 'error');
          }
      })
      .catch(error => {
          console.error(error);
          showCustomAlert('Lỗi rồi!', 'Lỗi đường truyền! Hãy kiểm tra mạng của bạn và thử lại.', 'error');
      })
      .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
      });
    });
  }
  
  // Event listeners
  document.addEventListener('mousemove', emitLeaf);

  
});

// ================= CUSTOM ALERT MODAL =================
function showCustomAlert(title, message, type = 'success') {
    const alertBox = document.getElementById('custom-alert');
    if(!alertBox) return alert(message); // Fallback
    
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    
    const icon = document.getElementById('alert-icon');
    const tape = document.getElementById('alert-tape');
    const titleEl = document.getElementById('alert-title');
    
    if (type === 'success') {
        icon.textContent = '🌿';
        tape.className = "absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#98FF98]/80 transform rotate-2 border border-green-300 shadow-sm z-30";
        titleEl.className = "text-3xl handwriting font-bold mb-2 text-[#2e7d32] border-b-2 border-dashed border-[#2e7d32] pb-2 inline-block";
    } else {
        icon.textContent = '🥀';
        tape.className = "absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-pink-300/80 transform -rotate-2 border border-pink-400 shadow-sm z-30";
        titleEl.className = "text-3xl handwriting font-bold mb-2 text-red-600 border-b-2 border-dashed border-red-600 pb-2 inline-block";
    }
    
    alertBox.classList.remove('hidden');
    // Nhỏ delay để browser kịp áp dụng display block trước khi transition
    setTimeout(() => {
        alertBox.classList.remove('opacity-0');
        alertBox.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeCustomAlert() {
    const alertBox = document.getElementById('custom-alert');
    if(!alertBox) return;
    
    alertBox.classList.add('opacity-0');
    alertBox.querySelector('div').classList.add('scale-95');
    
    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 300); // 300ms bằng với thời gian duration-300
}

// Hàm Modal ngoài DOMContentLoaded (để gọi từ button attribute `onclick`)
function openMomentModal() {
    const modal = document.getElementById('momentModal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    // Delay nhỏ để browser kịp render display: flex trước khi chạy transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        const modalContent = modal.querySelector('div');
        if (modalContent) modalContent.classList.remove('scale-95');
    }, 10);
}

function closeMomentModal() {
    const modal = document.getElementById('momentModal');
    if (!modal) return;
    
    modal.classList.add('opacity-0');
    const modalContent = modal.querySelector('div');
    if (modalContent) modalContent.classList.add('scale-95');
    
    // Đợi transition hoàn thành
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Function Preview Hình ảnh upload
function previewImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.style.backgroundImage = `url('${e.target.result}')`;
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Khởi chạy khi load trang chủ
document.addEventListener('DOMContentLoaded', () => {
    loadMomentsOnHomepage();
});

// Load ảnh động đã được duyệt trên trang chủ
function loadMomentsOnHomepage() {
    const listContainer = document.getElementById('moments-container');
    if(!listContainer) return;

    let moments = JSON.parse(localStorage.getItem('green_moments') || '[]');
    let needsUpdate = false;
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Tự động archive (Lưu trữ) các khoảnh khắc quá 1 tuần (7 ngày)
    moments.forEach(m => {
        if (m.status === 'approved' && (now - m.timestamp > oneWeek)) {
            m.status = 'archived';
            needsUpdate = true;
        }
    });
    if (needsUpdate) {
        localStorage.setItem('green_moments', JSON.stringify(moments));
    }

    let approvedMoments = moments.filter(m => m.status === 'approved');

    // Chèn tối đa 100 tấm
    approvedMoments = approvedMoments.slice(0, 100);

    if(approvedMoments.length > 0) {
        approvedMoments.reverse().forEach((moment, index) => { // mới nhất lên đầu
            const rotate = (Math.random() * 8) - 4; // Từ -4 đến 4 độ
            const pinColors = ['red', 'blue', 'purple', 'green', 'yellow'];
            const pinColor = pinColors[index % pinColors.length];
            const isPushpin = index % 2 === 0; // xen kẽ washi tape và pushpin

            const itemHTML = `
                <div class="relative group mt-4 hover:z-50 transition-all w-full max-w-[200px] animate-fade-in">
                    <div class="bg-white p-2 pb-8 border border-gray-200 shadow-md transform hover:scale-110 transition-all duration-300 relative w-full group-hover:rotate-0" style="transform: rotate(${rotate}deg)">
                        ${isPushpin ? `
                            <div class="absolute -top-3 left-1/2 w-5 h-5 bg-${pinColor}-400 rounded-full shadow-md z-30 border-[1.5px] border-${pinColor}-600 flex items-center justify-center transform -translate-x-1/2">
                                <div class="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                            </div>
                        ` : `
                            <div class="absolute -top-3 -right-2 w-10 h-4 bg-${pinColor}-200/80 transform rotate-[-15deg] shadow-sm z-30"></div>
                        `}
                        <img src="${moment.image}" alt="Moment" class="w-full aspect-square object-cover border border-gray-100 bg-gray-100">
                        <p class="handwriting text-center mt-2 text-xs md:text-sm text-ink-black px-1 truncate" title="${moment.caption}">"${moment.caption}"</p>
                        <p class="handwriting text-center text-[10px] text-gray-500 truncate">- ${moment.name} -</p>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('afterbegin', itemHTML); // Chèn vào đầu danh sách Grid
        });
    }
}

// ============== ADMIN PANEL LOGIC ==============
function loadAdminPanel() {
    let moments = JSON.parse(localStorage.getItem('green_moments') || '[]');
    
    const pendingList = document.getElementById('pendingList');
    const approvedList = document.getElementById('approvedList');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');

    if(!pendingList) return; // Nếu ko phải trang admin thì thôi

    let pendingHTML = '';
    let approvedHTML = '';
    let pCount = 0;
    let aCount = 0;

    moments.forEach(moment => {
        const itemHTML = `
            <div class="border border-gray-200 rounded-xl p-4 bg-gray-50 flex gap-4 items-start shadow-sm hover:shadow-md transition">
                <div class="w-24 h-24 rounded-lg border border-gray-300 flex-shrink-0 bg-cover bg-center" style="background-image: url('${moment.image}')"></div>
                <div class="flex-1">
                    <h4 class="font-bold text-lg text-ink-black flex justify-between items-center">
                        ${moment.name}
                        <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">${new Date(moment.timestamp).toLocaleDateString('vi-VN')}</span>
                    </h4>
                    <p class="text-sm text-gray-600 mb-1">📍 Trạm: <span class="font-semibold px-2 bg-white border border-gray-200 rounded-full">${moment.station}</span></p>
                    <p class="italic text-gray-700 handwriting text-lg">"${moment.caption}"</p>
                </div>
                ${moment.status === 'pending' ? `
                    <div class="flex flex-col gap-2">
                        <button onclick="changeStatus('${moment.id}', 'approved')" class="bg-mint-green hover:bg-green-400 text-ink-black font-bold px-3 py-1 rounded border-2 border-ink-black shadow-[2px_2px_0px_#2c3e50] text-sm transform hover:-translate-y-1 transition object-cover">
                            Duyệt
                        </button>
                        <button onclick="changeStatus('${moment.id}', 'rejected')" class="bg-red-300 hover:bg-red-400 text-ink-black font-bold px-3 py-1 rounded border-2 border-ink-black shadow-[2px_2px_0px_#2c3e50] text-sm transform hover:-translate-y-1 transition">
                            Từ chối
                        </button>
                    </div>
                ` : `
                    <div class="flex flex-col gap-2 justify-center">
                         <button onclick="changeStatus('${moment.id}', 'pending')" class="text-xs underline text-gray-500 hover:text-red-500 px-2 py-1">
                             Rút lại (Gỡ bài)
                         </button>
                         <button onclick="changeStatus('${moment.id}', 'rejected')" class="text-xs underline text-red-500 hover:text-red-700 font-bold px-2 py-1">
                             Xóa vĩnh viễn
                         </button>
                    </div>
                `}
            </div>
        `;

        if(moment.status === 'pending') {
            pendingHTML += itemHTML;
            pCount++;
        } else if(moment.status === 'approved') {
            approvedHTML += itemHTML;
            aCount++;
        }
    });

    if(pCount > 0) pendingList.innerHTML = pendingHTML;
    else pendingList.innerHTML = '<p class="text-gray-400 italic text-center py-6">Không có khoảnh khắc nào chờ duyệt.</p>';
    
    if(aCount > 0) approvedList.innerHTML = approvedHTML;
    else approvedList.innerHTML = '<p class="text-gray-400 italic text-center py-6">Chưa có ảnh nào được duyệt.</p>';

    pendingCount.textContent = pCount;
    approvedCount.textContent = aCount;
}

function changeStatus(id, newStatus) {
    let moments = JSON.parse(localStorage.getItem('green_moments') || '[]');
    let idx = moments.findIndex(m => m.id === id);
    if(idx > -1) {
        if(newStatus === 'rejected') {
             moments.splice(idx, 1); // Xóa luôn nếu từ chối
        } else {
             moments[idx].status = newStatus;
        }
        localStorage.setItem('green_moments', JSON.stringify(moments));
        loadAdminPanel(); // Vẽ lại ngay lập tức
    }
}

function clearAllData() {
    if(confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu test trong LocalStorage?")) {
        localStorage.removeItem('green_moments');
        loadAdminPanel();
    }
}

        document.addEventListener('DOMContentLoaded', function () {
            // Initialize Swiper
            const heroSwiper = new Swiper('.heroSwiper', {
                loop: true,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                autoplay: {
                    delay: 4500,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + ' !bg-[#2c3e50] !w-4 !h-4 !border-2 !border-white shadow"></span>';
                    },
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });

// Function for Nearest Station Search
function findNearestStation() {
    const input = document.getElementById('addressInput').value.trim().toLowerCase();
    const resultBox = document.getElementById('searchResult');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    
    if (!input) {
        showCustomAlert('Opps!', 'Hãy nhập địa chỉ của bạn để chúng mình tìm nhé!', 'error');
        return;
    }
    
    // UI states
    resultBox.classList.remove('hidden');
    resultBox.classList.add('flex');
    loadingState.classList.remove('hidden');
    loadingState.classList.add('flex');
    resultState.classList.add('hidden');
    resultState.classList.remove('flex');
    
    // Mock algorithm
    setTimeout(() => {
        let stationName = '';
        let stationAddress = '';
        let mapLink = '';
        let distance = (Math.random() * 3 + 1).toFixed(1); // 1.0 - 4.0 km
        
        // Simple keyword matching for Thanh Hoa locations
        if (input.includes('đông thọ') || input.includes('bắc ga') || input.includes('nam ngạn') || input.includes('hàm rồng')) {
            stationName = 'Tiệm Trà Mầm';
            stationAddress = 'KĐT Đông Bắc Ga, P. Đông Thọ, Thanh Hóa';
            mapLink = 'https://maps.google.com/?q=Đông+Bắc+Ga+Thanh+Hóa';
            distance = (Math.random() * 1.5 + 0.2).toFixed(1); // 0.2 - 1.7 km
        } else if (input.includes('điện biên') || input.includes('lê hoàn') || input.includes('ba đình') || input.includes('ngọc trạo') || input.includes('gác xép')) {
            stationName = 'Cafe Gác Xép';
            stationAddress = 'Đường Lê Hoàn, P. Điện Biên, Thanh Hóa';
            mapLink = 'https://maps.google.com/?q=Đường+Lê+Hoàn+Thanh+Hóa';
            distance = (Math.random() * 1.5 + 0.2).toFixed(1); 
        } else if (input.includes('quảng trường') || input.includes('lam sơn') || input.includes('trường thi') || input.includes('đông hương') || input.includes('chuyến xe')) {
            stationName = 'Chuyến Xe Xanh (Lưu động)';
            stationAddress = 'Khu vực Quảng trường Lam Sơn, Thanh Hóa (Sáng CN)';
            mapLink = 'https://maps.google.com/?q=Quảng+trường+Lam+Sơn+Thanh+Hóa';
            distance = (Math.random() * 1.5 + 0.2).toFixed(1);
        } else {
            // Random assignment if no keyword matched
            const stations = [
                { name: 'Tiệm Trà Mầm', addr: 'KĐT Đông Bắc Ga, P. Đông Thọ', link: 'https://maps.google.com/?q=Đông+Bắc+Ga+Thanh+Hóa' },
                { name: 'Cafe Gác Xép', addr: 'Đường Lê Hoàn, P. Điện Biên', link: 'https://maps.google.com/?q=Đường+Lê+Hoàn+Thanh+Hóa' },
                { name: 'Chuyến Xe Xanh (Lưu động)', addr: 'Quảng trường Lam Sơn (Sáng CN)', link: 'https://maps.google.com/?q=Quảng+trường+Lam+Sơn+Thanh+Hóa' }
            ];
            const randomPick = stations[Math.floor(Math.random() * stations.length)];
            stationName = randomPick.name;
            stationAddress = randomPick.addr;
            mapLink = randomPick.link;
        }
        
        document.getElementById('resultStationName').textContent = stationName;
        document.getElementById('resultAddress').textContent = '📍 ' + stationAddress;
        document.getElementById('resultDistance').textContent = distance + ' km';
        document.getElementById('resultMapLink').href = mapLink;
        
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        resultState.classList.remove('hidden');
        resultState.classList.add('flex');
        
    }, 1500); // 1.5s delay to simulate calculation
}
