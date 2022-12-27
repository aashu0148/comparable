import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  Colors,
  Header,
  LearnMoreLinks,
} from 'react-native/Libraries/NewAppScreen';
import BackgroundService from 'react-native-background-actions';

const backendUrl = 'https://queue.comparable.shop';

let updateStateText = f1 => console.log('no func attached', f1());

const handleReqCatch = async (err, reqObj) => {
  console.log('Error making req', err);

  await fetch(`${backendUrl}/submit`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      ...reqObj,
      completed: false,
      result: '',
    }),
  }).catch(err => void err);
};

const processTask = async () => {
  const startTime = Date.now();
  const res = await fetch(`${backendUrl}/consume`).catch(err =>
    console.log(err),
  );
  const data = await res?.json();
  if (!data?.success || !data?.data) return;

  const reqObj = data.data;
  const {url, type, body, headers = {}, startText = '', endText = ''} = reqObj;

  let response;
  const l1 = `📍 Making call to - ${url}`;
  updateStateText(prev => (Array.isArray(prev) ? [...prev, l1] : [l1]));
  console.log(l1);
  if (type == 'get')
    response = await fetch(url, {method: 'GET', headers}).catch(err =>
      handleReqCatch(err, reqObj),
    );
  else if (type == 'post')
    response = await fetch(url, {
      method: 'POST',
      headers: {...headers, 'content-type': 'application/json'},
      body,
    }).catch(err => handleReqCatch(err, reqObj));
  else return;

  let text = (await response.text()) || '';
  if (startText && typeof text == 'string')
    text = text.slice(text.indexOf(startText));
  if (endText && typeof text == 'string')
    text = text.slice(0, text.indexOf(endText));

  const l2 = `🐣 response received - ${text?.slice(0, 150)}`;
  updateStateText(prev => (Array.isArray(prev) ? [...prev, l2] : [l2]));
  console.log(l2);

  await fetch(`${backendUrl}/submit`, {
    method: 'POST',
    headers: {
      accept: '*,application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      ...reqObj,
      completed: true,
      result: text,
    }),
  })
    .then(async res => {
      const endTime = Date.now();
      const net = endTime - startTime;
      const l3 = `✅ submitted (${net / 1000}sec) ${await res.text()}`;
      updateStateText(prev => (Array.isArray(prev) ? [...prev, l3] : [l3]));
      console.log(l3);
    })
    .catch(err => console.log('🚩 submitting error->', err.message));
};

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const bgTask = async taskDataArguments => {
  // Example of an infinite loop task
  const {delay} = taskDataArguments;
  await new Promise(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      await processTask();
      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'Background task',
  taskTitle: 'Background task',
  taskDesc:
    'Running in background, please do not close the app from background',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  parameters: {
    delay: 8000,
  },
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handleClick = async () => {
    await BackgroundService.start(bgTask, options);
    await BackgroundService.updateNotification({
      taskDesc: 'Running in background',
    });
    setLogs(prev => [...prev, '🟢 Service started']);
  };

  // const handleFetch = async () => {
  //   console.log(input);
  //   const res = await fetch(input).catch(err => console.log(err.message));
  //   const data = await res?.text();
  //   if (!data) return;
  //   console.log(data.slice(0, 100));
  // };

  useEffect(() => {
    updateStateText = setLogs;
    handleClick();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <Button
              title="Start service"
              onPress={async () => {
                await BackgroundService.start(bgTask, options);
                setLogs(prev => [...prev, '🟢 Service started']);
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Stop service"
              onPress={async () => {
                await BackgroundService.stop(bgTask, options);
                setLogs(prev => [...prev, '🔴 Service stopped']);
              }}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Clear Logs"
            onPress={() => {
              setLogs([]);
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            padding: 20,
            height: '100%',
          }}>
          {Array.isArray(logs)
            ? logs.map((item, index) => (
                <Text
                  key={index + item.slice(10, 30) + ''}
                  style={{marginBottom: 14, fontWeight: 'bold'}}>
                  {index + 1}. {item}
                </Text>
              ))
            : ''}
          {/* <TextInput
            style={{borderColor: 'blue', margin: 5, borderWidth: 1}}
            placeholder="Enter url here"
            onChangeText={val => setInput(val)}
          />
          <Button title="Fetch" onPress={handleFetch} />
          <Button title="Click here" onPress={handleClick} />
          <Text>Hello</Text>
          <LearnMoreLinks /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    margin: 5,
  },
});

export default App;
