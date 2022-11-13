import { TextField, Button, Box, Divider } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { useEffect, useState } from 'react';
import { Progress } from 'electron-dl';
import BtnState from 'renderer/ts/classes/btn.state';
import DownloadState from 'renderer/ts/classes/download.state';
import { DownloadProps } from 'renderer/ts/types/download.props';
import { toast } from 'react-toastify';

function Download({ id, onDelete }: DownloadProps) {
  const downloadStateOptions = {
    ready: new DownloadState(
      'ready',
      new BtnState('contained', 'Скачать', false)
    ),
    inProgress: new DownloadState(
      'inProgress',
      new BtnState('outlined', 'Пауза', false)
    ),
    stopped: new DownloadState(
      'stopped',
      new BtnState('outlined', 'Продолжить', false)
    ),
    done: new DownloadState('done', new BtnState('contained', 'Готово', true)),
  };

  const [downloadState, setDownloadState] = useState(
    downloadStateOptions.ready
  );
  const [progPercent, setProgPercent] = useState(0);
  const [url, setUrl] = useState('');

  const onDownload = () => {
    console.log(`Url: ${url}`);
    window.electron.ipcRenderer.sendMessage('download', [url]);
  };

  const clickDownloadHandler = () => {
    if (downloadState.name === downloadStateOptions.ready.name) {
      setDownloadState(downloadStateOptions.inProgress);
      onDownload();
      return;
    }
    if (downloadState.name === downloadStateOptions.inProgress.name) {
      setDownloadState(downloadStateOptions.stopped);
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('download-progress', (args) => {
      const progress: Progress = args as Progress;
      setProgPercent(progress.percent * 100);
    });

    window.electron.ipcRenderer.once('download-complete', (event, args) => {
      setDownloadState(downloadStateOptions.done);
    });

    window.electron.ipcRenderer.once('download-started', (event, args) => {
      console.log(`Received from download-started: ${args}`);
      setDownloadState(downloadStateOptions.inProgress);
    });
  });

  // Функция для alert с ошибкой
  const notify = (text: string) => {
    toast.error(text, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          id="outlined-basic"
          label="URL"
          variant="outlined"
          sx={{ width: '40%' }}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
        />
        <Button
          sx={{ alignSelf: 'center' }}
          onClick={() => {
            clickDownloadHandler();
          }}
          disabled={downloadState.btnState.isDisabled}
        >
          {downloadState.btnState.text}
        </Button>
        <Box
          sx={{
            width: '20%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span>{`${progPercent.toFixed(2)}%`}</span>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton
            onClick={() => {
              onDelete(id);
            }}
          >
            <Icon>cancel</Icon>
          </IconButton>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
}

export default Download;
