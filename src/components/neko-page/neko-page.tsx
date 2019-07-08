import * as React from 'react';
import {
  AppBar,
  Container,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem
} from '@material-ui/core';
import { config } from '../..';
import NekoDisplayImage from './neko-display-image';
import NekoIcon from '@material-ui/icons/SdCardRounded';
import RefreshIcon from '@material-ui/icons/RefreshRounded';
import DownloadIcon from '@material-ui/icons/CloudDownloadRounded';
import GitHubIcon from './../../github-icon.svg';
import api from '../../api';
import { RxHttpRequest } from '@akanass/rx-http-request';
import { Subject, combineLatest, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  switchMap,
  startWith,
  finalize,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import { INekoImage, INekoRoute } from '../../models/neko-image';
import './neko-page.scss';
import { NekRoutes } from '../../api-routes';

export interface INekoPageProps {}
export interface INekoPageState {
  currentNeko?: INekoImage;
  nekoLoading: boolean;
  downloading?: boolean;
  nekoRoutes: INekoRoute[];
  currentNekoRoute: INekoRoute;
}
export default class NekoPage extends React.Component<
  INekoPageProps,
  INekoPageState
> {
  private client: RxHttpRequest;
  constructor(props: INekoPageProps) {
    super(props);
    this.state = {
      nekoLoading: true,
      nekoRoutes: NekRoutes,
      currentNekoRoute: NekRoutes[0]
    };
    this.client = api.instance();
  }
  private onRefresh = new Subject<void>();
  private onRefresh$ = this.onRefresh.asObservable().pipe(debounceTime(500));
  private currentRoute = new BehaviorSubject<INekoRoute>(NekRoutes[0]);
  private currentRoute$ = this.currentRoute
    .asObservable()
    .pipe(distinctUntilChanged());
  async componentDidMount() {
    combineLatest(
      this.onRefresh$.pipe(startWith(void 0)),
      this.currentRoute$.pipe(startWith(NekRoutes[0]))
    )
      .pipe(switchMap(() => this.currentRoute.getValue().request()))
      .subscribe(x => {
        console.log(x);
        this.setState({
          currentNeko: x.body
        });
      });
  }

  public render() {
    const { currentNeko } = this.state;
    return (
      <Box flexDirection="column" display="flex">
        <AppBar position="static">
          <Container maxWidth="md">
            <Toolbar>
              <Box
                display="flex"
                flex="1"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <NekoIcon style={{ marginRight: 12 }} />
                <Typography variant="h6">{config.name}</Typography>
                <Box flex="1" />
                <IconButton
                  style={{ marginRight: 8 }}
                  onClick={async () => {
                    this.setState(
                      {
                        nekoLoading: true
                      },
                      () => this.onRefresh.next()
                    );
                  }}
                >
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  target="_blank"
                  style={{ marginRight: 8 }}
                  href={currentNeko ? currentNeko.url : '#'}
                  disabled={!currentNeko}
                  download={
                    currentNeko
                      ? currentNeko.url.substring(
                          currentNeko.url.lastIndexOf('/') + 1
                        )
                      : '#'
                  }
                  onClick={() => {}}
                >
                  <DownloadIcon />
                </IconButton>
                <Select
                  value={this.state.currentNekoRoute.name}
                  onChange={async prop => {
                    const r = this.state.nekoRoutes.find(
                      x => x.name === prop.target.value
                    );
                    if (r) {
                      this.setState(
                        {
                          currentNekoRoute: r
                        },
                        () => {
                          this.setState(
                            {
                              nekoLoading: true
                            },
                            () => {
                              this.currentRoute.next(r);
                            }
                          );
                        }
                      );
                    }
                  }}
                >
                  {this.state.nekoRoutes.map(x => (
                    <MenuItem
                      key={x.name}
                      disabled={this.state.currentNekoRoute.name === x.name}
                      value={x.name}
                    >
                      {x.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Container
          style={{ width: '100%', position: 'relative' }}
          maxWidth={undefined}
        >
          <Box display="flex" flex="1" justifySelf="stretch">
            {currentNeko && currentNeko.url && (
              <NekoDisplayImage
                isLoading={this.state.nekoLoading}
                onLoad={async () =>
                  this.setState({
                    nekoLoading: false
                  })
                }
                currentNeko={currentNeko}
              />
            )}
          </Box>
        </Container>
        <Box
          display="flex"
          style={{ marginTop: 50 }}
          flexDirection="column"
          alignContent="center"
          alignItems="center"
          justifyContent="center"
        >
          <div>venipa.net &copy; Neko Splash, Some rights reserved</div>
          <div>
            <small>nekos.life &copy; GPLv3 rights reserved upon API</small>
            <IconButton href="https://github.com/Nekos-life" target="_blank">
              <svg
              style={{verticalAlign: 'middle'}}
              height="16px"
              width="16px"
                viewBox="0 0 256 250"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z"
                    fill="#161614"
                  />
                </g>
              </svg>
            </IconButton>
          </div>
        </Box>
      </Box>
    );
  }
}