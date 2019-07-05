const getUserIP = () => new Promise(res => {
  const myPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection
  const pc = new myPeerConnection({
      iceServers: [],
    }),
    noop = () => {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,

  function iterateIP(ip) {
    res(ip)
  }

  //create a bogus data channel
  pc.createDataChannel('')

  // create offer and set local description
  pc.createOffer((sdp) => {
    sdp.sdp.split('\n').forEach((line) => 
      line.includes('candidate') && line.match(ipRegex).forEach(iterateIP)
    )

    pc.setLocalDescription(sdp, noop, noop)
  }, noop)

  //listen for candidate events
  pc.onicecandidate = (ice) => {
    if (
      !ice ||
      !ice.candidate ||
      !ice.candidate.candidate ||
      !ice.candidate.candidate.match(ipRegex)
    )
      return
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP)
  }
})
