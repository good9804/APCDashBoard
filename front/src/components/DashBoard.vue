<template>
  <div class="flex-wrap p-2 sm:ml-64">
    <div
      class="p-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14"
    >
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div
          class="bg-white border border-gray-200 rounded-lg shadow dark:bg-white-800 dark:border-white-700"
        >
          <Line id="my-chart-id" :options="chartOptions" :data="chartData" />
        </div>
        <div
          class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-white-800 dark:border-white-700"
        >
          <Line id="my-chart-id" :options="chartOptions" :data="chartData" />
        </div>

        <div
          class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-white-800 dark:border-white-700"
        >
          <label
            for="countries"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Select an option</label
          >
          <div class="file-upload">
            <input type="file" accept="image/*" @change="onFileChange" />
            <button
              @click="onUploadFile"
              class="upload-button"
              :disabled="!this.selectedFile"
            >
              Upload file
            </button>
          </div>
          <div>
            <img :src="uploadFile" />
          </div>
        </div>
        <div
          class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-white-800 dark:border-white-700"
        >
          <div>
            <button id="show-modal" @click="showModal = true">
              Show Modal
            </button>
            <!-- use the modal component, pass in the prop -->
            <ModalTool v-if="showModal" @close="showModal = false">
              <!--
       you can use custom content here to overwrite
       default content
       -->
              <template v-slot:header>모달 창 제목</template>
            </ModalTool>
          </div>
        </div>
        <div
          class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-white-800 dark:border-white-700"
        >
          카프카(서버간의 통신이 가능할 경우) or fluentd(log 파일기반일 경우)
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ModalTool from "./Modal/ModalTool";

import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "LineChart",
  components: { Line, ModalTool },
  data() {
    return {
      showModal: false,
      chartData: {
        labels: [
          "-20",
          "-18",
          "-16",
          "-14",
          "-12",
          "-10",
          "-8",
          "-6",
          "-4",
          "-2",
          "현재시간",
        ],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [40, 39, 10, 40, 39, 80, 40, 40, 39, 10, 40],
          },
          {
            label: "Data two",
            backgroundColor: "#8179f8",
            data: [39, 10, 40, 39, 80, 40, 40, 39, 10, 40, 39],
          },
        ],
      },
      chartOptions: {
        scales: {
          x: {
            stacked: false, // 쌓임
            display: true, // x 축 show
            scaleLabel: {
              display: true,
              labelString: "시간(초)",
            },
            grid: {
              drawBorder: false,
              color: "#323232",
              lineWidth: 1,
            },
          },
          // y축 옵션
          y: {
            stacked: false, // 쌓임
            display: true, // y 축 show
            ticks: {
              stepSize: 20, // 증가범위
              beginAtZero: true,
              max: 100, // 최대범위
              min: 0, // 최소범위
              padding: 10, // 오른쪽 간격
            },
            grid: {
              drawBorder: false,
              color: "#323232",
              lineWidth: 1,
            },
          },
        },
        maintainAspectRatio: false,
      },
      selectedFile: "",
      uploadFile: "",
    };
  },
  mounted() {
    // setTimeout(() => {
    //   this.$router.go(this.$router.currentRoute); // 자동 새로고침
    // }, 5000);
  },
  methods: {
    onFileChange(event) {
      const selectedFile = event.target.files[0]; // accessing file
      this.selectedFile = selectedFile;
    },
    onUploadFile() {
      this.uploadFile = "";
      const formData = new FormData();
      formData.append("file", this.selectedFile); // appending file
      // sending file to the backend
      this.$axios
        .post("/dashboard/api/upload", formData)
        .then((res) => {
          console.log(res.data.imgdata.data);
          this.uploadFile = this.arrayBufferToBase64(res.data.imgdata.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    arrayBufferToBase64(buffer) {
      var mime;
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      if (len < 4) return null;
      var b0 = bytes[0];
      var b1 = bytes[1];
      var b2 = bytes[2];
      var b3 = bytes[3];
      if (b0 == 0x89 && b1 == 0x50 && b2 == 0x4e && b3 == 0x47)
        mime = "image/png";
      else if (b0 == 0xff && b1 == 0xd8) mime = "image/jpeg";
      else if (b0 == 0x47 && b1 == 0x49 && b2 == 0x46) mime = "image/gif";
      else return null;
      var binary = "";
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      var base64 = window.btoa(binary);
      return "data:" + mime + ";base64," + base64;
    },
  },
};
</script>
