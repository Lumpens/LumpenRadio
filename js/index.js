import Pjax from "pjax";
import $ from "jquery";
import { Howler, Howl } from "howler";
import countdown from "./countdown";

let bodyScrollPosition;

const menuToggleOnClick = (selector, show) => {
  const $body = $("body");
  $(selector).click(() => {
    if (show) { (bodyScrollPosition = $body.scrollTop()); }
    $(".menu").css("display", show ? "flex" : "none");
    $body.css("position", show ? "fixed" : "static");
    if (!show) { $body.scrollTop(bodyScrollPosition); }
  });
};

const externalizeLinks = () => {
  $("a").filter((_, elem) => elem.hostname && elem.hostname !== location.hostname).attr("target", "_blank");
};

const initCountdown = () => {
  countdown($(".countdown").attr("data-date"), (timeSegments) => {
    if (!timeSegments) {
      $(".countdown").hide();
      return;
    }
    $(".countdown .days").html(timeSegments[0]);
    $(".countdown .hours").html(timeSegments[1]);
    $(".countdown .minutes").html(timeSegments[2]);
    $(".countdown .seconds").html(timeSegments[3]);
  });
};

export default function setup() {
  new Pjax({
    elements: ["a"],
    selectors: ["title", ".content", ".menu__list", ".section-footer"],
  });

  externalizeLinks();
  menuToggleOnClick(".top-row__hamburger", true);
  menuToggleOnClick(".menu__close-button, .menu__link", false);
  initCountdown();

  $(document).on("pjax:complete", () => {
    externalizeLinks();
    menuToggleOnClick(".menu__link", false);
    initCountdown();
  });

  const $play = $("#play-button");
  const $pause = $("#pause-button");
  const $loading = $(".player__loading-icon");

  Howler.unload();

  const stream = new Howl({
    src: "http://stream.lumpen.fm:7416/;stream/1",
    format: "mp3",
    html5: true,
    preload: false,
    onload () {
      $loading.hide();
      $pause.show();
    },
    onloaderror (_, error) {
      console.log("error:");
      console.log(error);
    },
  });

  $(".player__buttons").click(() => {
    if (stream.playing()) {
      $pause.hide();
      $play.show();
      stream.pause();
    } else {
      $play.hide();
      stream.state() === "loaded" ? $pause.show() : $loading.show();
      stream.play();
    }
  });
}
