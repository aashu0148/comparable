const [reqData, setReqData] = useState([]);
const [resData, setResData] = useState([]);
const handleSocketData = async (data) => {
  const resKey = data?.responseKey;

  let correspondingReq, reqData;
  flushSync(async () => {
    await setReqData((prev) => {
      reqData = [...prev];
      correspondingReq = prev.find((item) => item.resKey == resKey);
      return prev;
    });
  });

  if (!correspondingReq) {
    console.log(
      "corresponding req not found for -> ",
      data.from,
      data,
      reqData
    );
    return;
  }

  let correspondingRes, correspondingResIndex;
  let currTime = Date.now();
  await setResData((prev) => {
    const tempRes = [...prev];
    correspondingResIndex = tempRes.findIndex((item) => item.resKey == resKey);

    if (correspondingResIndex > -1) {
      correspondingRes = { ...tempRes[correspondingResIndex] };
      correspondingRes[data.from] = `${(
        (currTime - correspondingReq.startTime) /
        1000
      ).toFixed(1)}s`;
      correspondingRes.data[data.from] = data.result;

      tempRes.splice(correspondingResIndex, 1, correspondingRes);
    } else {
      correspondingRes = {
        resKey,
        [data.from]: `${(
          (currTime - correspondingReq.startTime) /
          1000
        ).toFixed(1)}s`,
        data: {
          [data.from]: data.result,
        },
      };
      tempRes.push(correspondingRes);
    }
    return tempRes;
  });
};

const handleLoadTesting = () => {
  setReqData([]);
  for (let i = 0; i < 3; ++i) {
    let startTime = Date.now();
    getFashionProducts(
      inputValue || "redmi note 10 pro",
      "",
      "",
      connectionId
    ).then((res) => {
      const reqData = {
        startTime,
        resKey: res.data?.responseKey,
      };

      setReqData((prev) => [...prev, reqData]);
    });
  }
};

useEffect(() => {
  console.log(resData);
}, [resData]);
